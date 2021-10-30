import { Session } from "../../session/index"
/**
 * a TCP Game feed -> DOM renderer
 */
 export class Feed extends HTMLElement {

  static MIN_SCROLL_BUFFER = 300
  /**
   * maximum number of nodes to store in memory
   */
  static MAX_MEMORY_LENGTH = 100 * 5

  /**
   * creates a new Feed instance
   * tying a Session to an HTMLElement
   */
  constructor(readonly session : Session) {
    super()
    
    this.addEventListener("click", (e) => {
      const target = e.target as HTMLElement
      if (!target) return
      switch (target.tagName) {
        case "D":
        case "A":
          console.log("click -> %o", target)
          return console.warn("<%s> handling not implemented", target.tagName)
        default:
          return session.ui.cli.connectedCallback()
      }
    })

    this.classList.add("feed", "scroll")
  }

  get isScrolling() {
    // no content scrollable
    if (this.scrollHeight == this.clientHeight) return false
    // check the relative scroll offset from the head
    return (
      this.scrollHeight - this.scrollTop !==
      this.clientHeight
    )
  }
  /**
   * clean up all unsafe references
   */
  destroy() {
    this.idle()
    this.remove()
  }
  /**
   * mark a feed as idle
   */
  idle() {
    this.removeAttribute("focused")
    this.parentElement && this.parentElement.removeChild(this)
    return this
  }
  /**
   * clear previously rendered nodes
   */
  activate() {
    this.setAttribute("focused", "")
    this.scrollToNow()
    return this
  }
  /**
   * if the HEAD of the feed is a prompt or not
   */
  has_prompt() {
    return (
      this.lastElementChild &&
      this.lastElementChild.tagName.toLowerCase() === "prompt"
    )
  }
  /**
   * appends a single <pre> element to the HEAD
   * of the message feed
   *
   *  todo:
   *   1. handle when detached from DOM tree
   *   2. re-render slices of pruned nodes when scrolling
   */
  appendParsed(ele : DocumentFragment | Element) {
    if (!ele.hasChildNodes()) {
      return console.trace("{error: %o}", ele)
    }
    const was_scrolling = this.isScrolling
    // append the tag to the actual HTML
    this.append(ele)
    // if our pruned in-memory buffer has grown too long
    // we must prune it again.  These messages are lost forever
    // but that is what logs are for!
    this.flush()
    // scroll the feed to the HEAD position
    // TODO: Investigate pure CSS based pin-to-bottom scrolling: 
    // https://blog.eqrion.net/pin-to-bottom/ (may have better performance)
    if (!was_scrolling) this.scrollToNow()
  }
  /**
   * some user gesture (scrolling forward/button) has triggered
   * reattaching to the head of the message feed
   */
  scrollToNow () {
    this.scrollTop = this.scrollHeight
    return this
  }
  /**
   * finalizer for pruned nodes
   */
  flush() {
    while (this.childElementCount > Feed.MAX_MEMORY_LENGTH) {
      this.firstChild && this.firstChild.remove()
    }
    return this
  }
}


window.customElements.define("illthorn-feed", Feed)