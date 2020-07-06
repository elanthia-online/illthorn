const Compiler = require("../compiler/compiler")
const Settings = require("../settings")
const Bus = require("../bus")
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
    return (
      pre &&
      pre.classList &&
      pre.classList.contains("prompt") &&
      !pre.classList.contains("cli")
    )
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
    session.on("TAG", (tag) => this.add(tag))
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
  append(pre) {
    const was_scrolling = this._scrolling

    // swap for the latest prompt
    if (
      Feed.is_prompt(pre.firstElementChild) &&
      this.has_prompt()
    ) {
      return this.root.replaceChild(
        pre,
        this.root.lastElementChild
      )
    }
    // append the tag to the actual HTML
    this.root.append(pre)
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
    const streams = this.session.streams
    if (tag.name == "stream" && streams.wants(tag.id))
      return streams.insert(tag)
    if (Compiler.cannot_compile(tag)) return void 0

    Compiler.compile(tag, (compiled) => {
      Feed.consume(compiled, this)
    })
  }
}
