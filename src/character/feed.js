const Occlusion = require("../occlusion/occlusion")
const Compiler  = require("../compiler/compiler")
const Pipe      = require("@elanthia/koschei/dist/util/pipe").default
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
    if (feed.is_active()) return feed.append(message)
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
  constructor ({character, middleware = []}) {
    this.character  = character
    // todo: add hiliter, etc
    this.middleware = middleware 
    this.root       = document.createElement("div")
    this.root.classList.add("feed")
    this.retained   = []
    this._active    = false
    this._scrolling = false
    character.parser.on("tag", tag => this.add(tag))
    Feed.Feeds.set(character, this)
  }
  /**
   * add <pre> to the feed without rendering it
   */
  rpush (pre) {
    this.retained.push(pre)
    return this.flush()
  }
  /**
   * mark a feed as idle
   */
  idle () {
    this._active = false
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
    this._active = true
    this.root.innerHTML = ""
    const frag = document.createDocumentFragment()
    const to_render = this.retained.slice(0, 50)
    // todo: prune to max size?
    to_render.forEach(node => frag.appendChild(node))
    this.root.appendChild(frag)
    this.reattach_head()
    return this
  }
  /**
   * is this the current active feed?
   */
  is_active () {
    return this._active
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
   * appends a single <pre> element to the HEAD
   * of the message feed
   * 
   *  todo:
   *   1. handle when detached from DOM tree
   *   2. re-render slices of pruned nodes when scrolling
   */
  append (pre) {
    // swap for the latest prompt
    if (Feed.is_prompt(pre) && this.has_prompt()) {
      this.retained.pop()
      this.retained.push(pre)
      return this.root.replaceChild(pre, this.root.lastElementChild)
    }
    // add this to retained node list
    this.retained.push(pre)
    // append the tag to the actual HTML
    this.root.append(pre)
    // prune the real DOM
    Occlusion.prune(this.root, 
      {  retain: Percent(300)
      })
    // if our pruned in-memory buffer has grown too long
    // we must prune it again.  These messages are lost forever
    // but that is what logs are for!
    this.flush()
    // scroll the feed to the HEAD position
    this.scroll_to_bottom()
  }
  /**
   * scrolls to bottom of feed if a user has not
   *  detached from the HEAD of the feed
   */
  scroll_to_bottom () {
    if (this._scrolling) return
    this.root.scrollTop = this.root.scrollHeight
    return this
  }
  /**
   * some user gesture (scrolling forward/button) has triggered
   * reattaching to the head of the message feed
   */
  reattach_head () {
    this._scrolling = false
    return this.scroll_to_bottom()
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
      .fmap(Compiler.to_html)
      .fmap(Feed.consume, this)
  }
}