export class Streams extends HTMLElement {
  addEntry (entry : Element) {
    const wasScrolled = this.isScrolling
    this.appendChild(entry.cloneNode(true))
    if (wasScrolled) return 
    this.scrollToNow()
  }

  get isScrolling() {
    // no content scrollable
    if (this.scrollHeight == this.clientHeight) return false
    // check the relative scroll offset from the head
    //console.log("feed.scrollPosition=%s", this.scrollHeight - this.scrollTop - this.clientHeight)
    return this.scrollHeight - this.scrollTop - this.clientHeight > 1
  }

  scrollToNow () {
    this.scrollTop = this.scrollHeight
    return this
  }
}

window.customElements.define("illthorn-streams", Streams)