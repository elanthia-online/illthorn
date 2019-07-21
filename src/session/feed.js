const Occlusion = require("../occlusion/occlusion")
const Compiler  = require("../compiler/compiler")
const Pipe      = require("../util/pipe")
/**
 * verbose helper
 */
const Percent = 
  hundreds => hundreds / 100
/**
 * a TCP Game feed -> DOM renderer
 */
module.exports = class Feed {
  static Feeds = new Map()

  static MIN_SCROLL_BUFFER = 300
  /**
   * maximum number of nodes to store in memory
   */
  static MAX_MEMORY_LENGTH = 1000 * 1
  /**
   * safely check if an HTMLElement is a prompt or not
   */
  static is_prompt (pre) {

    return pre && pre.classList && pre.classList.contains("prompt")
  }
  /**
   * pure append method for Pipe interop
   */
  static append (message, feed) {
    return feed.append(message)
  }

  static consume (message, feed) {
    if (feed.has_focus()) return feed.append(message)
    feed.rpush(message)
  }
  /**
   * pure constructor
   */
  static of (opts) {
    return new Feed(opts)
  }
  /**
   * creates a new Feed instance
   * tying a Character to an HTMLElement
   */
  constructor ({session, middleware = []}) {
    this.session  = session
    // todo: add hiliter, etc
    this.middleware = middleware 
    this.root       = document.createElement("div")
    this.root.classList.add("feed")
    this.root.classList.add("scroll")
    this.retained   = []
    this._focused   = false
    this.root.addEventListener("mousewheel", e => this.on_user_scroll(e))
    session.parser.on("tag", tag => this.add(tag))
    Feed.Feeds.set(session, this)
  }

  on_user_scroll (e) {
    if (this._scrolling) {
      this.root.classList.add("scrolling")
      return this.root.scrollTop < Feed.MIN_SCROLL_BUFFER && this.render_history(e)
    }

    this.root.classList.remove("scrolling")
    this.prune()
  }

  render_history (e) {
    // scroll forward
    if (e.deltaY > 0) return
    // scroll back
    const last_rendered_idx = this.retained.indexOf(this.root.firstElementChild)
    // we have rendered the entire history already
    if (last_rendered_idx == 0) return
    // move the index to render back one so we can 
    // get the first retained node that is not rendered
    // todo: maybe use a full slice here?
    const idx_to_render = last_rendered_idx - 1
    // show it!
    this.root.prepend(this.retained[idx_to_render])
  }

  get _scrolling () {
    // no content scrollable
    if (this.root.scrollHeight == this.root.clientHeight) return false
    // check the relative scroll offset from the head
    return (this.root.scrollHeight - this.root.scrollTop) !== this.root.clientHeight
  }

  /**
   * clean up all unsafe references
   */
  destroy () {
    Feed.Feeds.delete(this.session)
    this.idle()
    this.root = 
    this.session = 
    this.retained.length = 
    this.middleware.length = 0
  }
  /**
   * add <pre> to the feed without rendering it
   */
  rpush (pre) {
    if (Feed.is_prompt(this.retained[this.retained.length-1]) && Feed.is_prompt(pre.firstElementChild)) {
      this.retained.pop()
    }
    this.retained.push(pre.firstElementChild)
    return this.flush()
  }
  /**
   * mark a feed as idle
   */
  idle () {
    if (this.root == 0) return
    this._focused = false
    this.root.parentElement && this.root.parentElement.removeChild(this.root)
    this.root.innerHTML = ""
    return this
  }
  /**
   * attach a Feed to the DOM
   */
  attach_to_dom (ele) {
    const frag = document.createDocumentFragment()
    frag.appendChild(this.root)
    ele.appendChild(frag)
    return this
  }
  /**
   * clear previously rendered nodes
   */
  activate () {
    // turn siblings off
    Array.from(Feed.Feeds).forEach(([_, feed]) => feed.idle())
    this._focused = true
    this.root.innerHTML = ""
    const frag = document.createDocumentFragment()
    const length = this.retained.length
    const to_render = this.retained.slice(length - 100, length)
    // todo: prune to max size?
    to_render.forEach(node => frag.appendChild(node))
    this.root.appendChild(frag)
    this.reattach_head()
    return this
  }
  /**
   * is this the current active feed?
   */
  has_focus () {
    return this._focused
  }
  /**
   * if the HEAD of the feed is a prompt or not
   */
  has_prompt () {
    if (this.root.children.length === 0) return false
    return Feed.is_prompt(this.root.lastElementChild)
  }
  /**
   * the current viewable slice of the retained nodes
   */
  view () {
    return { start : this.root.firstElementChild ? this.retained.indexOf(this.root.firstElementChild) : -1
           , end   : this.root.lastElementChild  ? this.retained.indexOf(this.root.lastElementChild)  : -1
           }
  }
  /**
   * prunes the retained DOM elements to something manageable
   */
  prune () {
   if (this._scrolling) return 

    return Occlusion.prune(this.root, 
      { retain     : Percent(500)
      , min_length : 100 // minimum number of nodes to retain in DOM
      })
  }

  /**
   * appends a single <pre> element to the HEAD
   * of the message feed
   * 
   *  todo:
   *   1. handle when detached from DOM tree
   *   2. re-render slices of pruned nodes when scrolling
   */
  append (pre) {
    const was_scrolling = this._scrolling

    // swap for the latest prompt
    if (Feed.is_prompt(pre.firstElementChild) && this.has_prompt()) {
      this.retained.pop()
      this.retained.push(pre.firstElementChild)
      return this.root.replaceChild(pre, this.root.lastElementChild)
    }
    // add this to retained node list
    this.retained.push(pre.firstElementChild)
    // append the tag to the actual HTML
    this.root.append(pre)
    // prune the real DOM
    this.prune()
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
  reattach_head () {
    this.root.scrollTop = this.root.scrollHeight
    return this
  }
  /**
   * finalizer for pruned nodes
   */
  flush () {
    while (this.retained.length > Feed.MAX_MEMORY_LENGTH) this.retained.shift()
    return this
  }

  add (tag) {
    if (Compiler.cannot_compile(tag)) return

    Pipe.of(tag)
      .fmap(Compiler.compile)
      .fmap(Feed.consume, this)
  }
}