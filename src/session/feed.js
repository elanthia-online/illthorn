const Settings = require("../settings")
const Bus = require("../bus")
const Parser = require("../parser")
const Pipe = require("../util/pipe")
const Lens = require("../util/lens")
const Url = require("../util/url")
const SessionState = require("./state")
const Hilites = require("../hilites")
const Mark = require("mark.js")
const io = require("../util/io")
/**
 * a TCP Game feed -> DOM renderer
 */
module.exports = class Feed {
  static Feeds = new Map()

  static MIN_SCROLL_BUFFER = 300
  /**
   * maximum number of nodes to store in memory
   */
  static MAX_MEMORY_LENGTH = 100 * 5
  /**
   * safely check if an HTMLElement is a prompt or not
   */
  static is_prompt(pre) {
    return pre && pre.tagName == "PROMPT"
  }
  /**
   * pure append method for Pipe interop
   */
  static append(message, feed) {
    return feed.append(message)
  }

  static consume(message, feed) {
    requestAnimationFrame(function () {
      feed.append(message)
    })
  }
  /**
   * pure constructor
   */
  static of(opts) {
    return new Feed(opts)
  }
  /**
   * creates a new Feed instance
   * tying a Character to an HTMLElement
   */
  constructor({ session, middleware = [] }) {
    this.session = session
    this.middleware = middleware
    this.root = document.createElement("div")

    Bus.on(Bus.events.REDRAW, (e) => {
      if (!this.root || !this.root.classList) return

      if (Settings.get("clickable")) {
        return this.root.classList.add("clickable")
      }
      this.root.classList.remove("clickable")
    })

    this.root.addEventListener("click", (e) => {
      if (!e.target) return
      if (!e.target.classList.contains("d")) return
      if (this.root.classList.contains("clickable")) {
        this.session.send_command(
          e.target.dataset.cmd || e.target.text
        )
      }
    })

    this.root.classList.add("feed")
    this.root.classList.add("scroll")
    this._focused = false
    Feed.Feeds.set(session, this)
  }

  get _scrolling() {
    // no content scrollable
    if (this.root.scrollHeight == this.root.clientHeight)
      return false
    // check the relative scroll offset from the head
    return (
      this.root.scrollHeight - this.root.scrollTop !==
      this.root.clientHeight
    )
  }

  /**
   * clean up all unsafe references
   */
  destroy() {
    Feed.Feeds.delete(this.session)
    this.idle()
    this.root = this.session = this.middleware.length = 0
  }
  /**
   * mark a feed as idle
   */
  idle() {
    if (this.root == 0) return
    this._focused = false
    this.root.parentElement &&
      this.root.parentElement.removeChild(this.root)
    return this
  }
  /**
   * attach a Feed to the DOM
   */
  attach_to_dom(ele) {
    const frag = document.createDocumentFragment()
    frag.appendChild(this.root)
    ele.appendChild(frag)
    return this
  }
  /**
   * clear previously rendered nodes
   */
  activate() {
    // turn siblings off
    Array.from(Feed.Feeds).forEach(([_, feed]) =>
      feed.idle()
    )
    this._focused = true
    this.reattach_head()
    return this
  }
  /**
   * is this the current active feed?
   */
  has_focus() {
    return this._focused
  }
  /**
   * if the HEAD of the feed is a prompt or not
   */
  has_prompt() {
    if (this.root.children.length === 0) return false
    return Feed.is_prompt(this.root.lastElementChild)
  }
  /**
   * appends a single <pre> element to the HEAD
   * of the message feed
   *
   *  todo:
   *   1. handle when detached from DOM tree
   *   2. re-render slices of pruned nodes when scrolling
   */
  append(ele) {
    const was_scrolling = this._scrolling

    // swap for the latest prompt
    if (Feed.is_prompt(ele) && this.has_prompt()) {
      return this.root.replaceChild(
        ele,
        this.root.lastElementChild
      )
    }
    // append the tag to the actual HTML
    this.root.append(ele)
    // if our pruned in-memory buffer has grown too long
    // we must prune it again.  These messages are lost forever
    // but that is what logs are for!
    this.flush()
    // scroll the feed to the HEAD position
    if (!was_scrolling) this.reattach_head()
  }
  /**
   * some user gesture (scrolling forward/button) has triggered
   * reattaching to the head of the message feed
   */
  reattach_head() {
    this.root.scrollTop = this.root.scrollHeight
    return this
  }
  /**
   * finalizer for pruned nodes
   */
  flush() {
    while (
      this.root.childElementCount > Feed.MAX_MEMORY_LENGTH
    ) {
      this.root &&
        this.root.firstChild &&
        this.root.firstChild.remove()
    }
    return this
  }

  add(tag) {
    if (Compiler.cannot_compile(tag)) return void 0

    Compiler.compile(tag, (compiled) => {
      Feed.consume(compiled, this)
    })
  }

  async ingestText(ele) {
    this.ingestState(ele, Feed.LOOSELY_NESTED_TAGS)
    this.ingestState(ele, Feed.TOP_LEVEL_STATUS_TAGS)
    const body = document.body
    // skip double insertions
    if (ele.textContent.trim().length == 0)
      return ele.remove()
    if (body.contains(ele)) return
    console.time("hilite")
    await this.addHilites(ele)
    console.timeEnd("hilite")
    this.append(ele)
  }

  async addHilites(ele) {
    const hilites = Hilites.get()
    if (hilites.length == 0) return 0
    const mark = new Mark(ele)
    return await hilites.reduce((io, [pattern, group]) => {
      return io.then(
        () =>
          new Promise((ok) =>
            mark.markRegExp(pattern, {
              className: group,
              done: ok,
            })
          )
      )
    }, Promise.resolve())
  }

  ingestTagBySelector(parsed, selector) {
    Pipe.of(parsed.querySelectorAll(selector))
      .fmap(
        Parser.each,
        (ele) =>
          Lens.get(ele, "parentElement.tagName") ==
            ele.tagName && ele.remove()
      )
      .fmap(Parser.each, (ele) => this.ingestText(ele))
  }

  ingestDocumentTextNodes(bod) {
    if (!bod.hasChildNodes()) return
    const span = document.createElement("span")
    // this must be a cloned reference!
    const nodes = [].slice.call(bod.childNodes)
    for (const ele of nodes) {
      // <a>, <i>, <b>
      if ((ele.tagName || "t").length == 1) {
        span.appendChild(ele)
      }
    }
    this.ingestText(span)
  }

  static TOP_LEVEL_STATUS_TAGS = [
    "progressbar",
    "container",
    "compass",
    "dialogdata",
    "compdef",
    "switchquickbar",
    "opendialog",
    "component",
    "exposecontainer",
    "deletecontainer",
    "right",
    "left",
    "inv",
    "stream.speech",
    "clearstream.inv",
    "clearcontainer",
    "casttime",
    "roundtime",
  ]

  static LOOSELY_NESTED_TAGS = [
    "streamwindow",
    "resource",
    "nav",
    "stream#room",
    "stream#inv",
    "clearstream",
    "streamwindow",
    "indicator",
  ]

  async ingestDocument(parsed) {
    return new Promise((ok) => {
      this.ingestState(parsed, Feed.TOP_LEVEL_STATUS_TAGS)
      const prompts = Parser.pop(parsed, "prompt")
      const prompt =
        prompts.length && prompts[prompts.length - 1]
      this.ingestTagBySelector(parsed, "pre")
      setTimeout(() => {
        // order of operations is (somewhat) important here!
        this.ingestTagBySelector(parsed, "stream")
        this.ingestTagBySelector(parsed, "mono")
        // handle top-level text nodes mixed with state tags
        // <dialogdata></dialogdata>Atone just arrived!
        this.ingestDocumentTextNodes(parsed.body)
        this.ingestDocumentTextNodes(parsed.head)
        if (prompt) this.append(prompt)
        this.pruneIgnorableTags(parsed)
        // make sure we handled all state tags that might
        // also contain renderable text
        this.ingestState(parsed, Feed.LOOSELY_NESTED_TAGS)

        const launch = parsed.querySelector("launchurl")
        // handles goals, bbs commands
        if (launch) {
          console.log(launch)
          launch.remove()
          Url.open_external_link(
            "https://www.play.net" +
              launch.attributes.src.value
          )
        }

        if (parsed.body.hasChildNodes()) {
          // this is for debugging
          console.log(
            "parsed:unhandled(children: %s, %o)",
            parsed.body.hasChildNodes(),
            (window._temp = parsed)
          )
        }
        return ok()
      }, 0)
    })
  }

  pruneIgnorableTags(parsed) {
    ;["resource"].forEach((selector) =>
      Pipe.of(
        parsed.querySelectorAll(selector)
      ).fmap(Parser.each, (ele) => ele.remove())
    )
  }

  ingestState(parsed, selectors) {
    selectors.forEach((selector) => {
      Pipe.of(parsed.querySelectorAll(selector))
        .fmap(Parser.each, (ele) => ele.remove())
        .fmap(Parser.each, (ele) => {
          SessionState.consume(this.session.state, ele)
        })
    })
  }
}
