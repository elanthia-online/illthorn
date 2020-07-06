const StreamsSettings = require("../settings").of("streams")

module.exports = class Streams {
  // this class on the top-level application element
  // signals which layout to use
  static STREAMS_ON = "streams-on"

  static STREAMS_BUFFER_LIMT = 1000

  static ENUM = {
    thoughts: 1,
    logon: 1,
    logoff: 1,
    speech: 1,
  }

  static Settings = StreamsSettings

  static of() {
    return new Streams()
  }

  constructor() {
    // TODO: This should probably use the standard Panel system.
    this._view = document.createElement("details")
    this._view.setAttribute("open", true)
    this._view.classList.add("panel", "streams", "scroll")
    this._view.insertAdjacentHTML(
      "afterbegin",
      `<summary>ESP</summary>`
    )
    this._settings = StreamsSettings
  }

  get _scrolling() {
    // no content scrollable
    if (this._view.scrollHeight == this._view.clientHeight)
      return false
    // check the relative scroll offset from the head
    return (
      this._view.scrollHeight - this._view.scrollTop !==
      this._view.clientHeight
    )
  }

  flush() {
    while (
      this._view.childElementCount >
      Streams.STREAMS_BUFFER_LIMT
    ) {
      this._view &&
        this._view.firstChild &&
        this._view.firstChild.remove()
    }
    return this
  }
  /**
   * ensure that a stream exists, and that it is less than 100 entries for the new one
   * to get added to it
   *
   * @param {string} stream_name
   */
  insert(tag) {
    const was_scrolling = this._scrolling
    const pre = document.createElement("pre")
    pre.classList.add(tag.id, tag.name)

    // TODO: Doesn't account for messages that use square brackets in the message itself. https://regex101.com/r/iMjWM1/1/
    const messageRegEx = /(\[.*\])(.*)/
    let messageParts = messageRegEx.exec(tag.text)
    pre.innerHTML = `
      <span class="stream-channel">${messageParts[1]}</span><span class="stream-text">${messageParts[2]}</span>
    `.trim()

    this._view.append(pre)
    // scroll the feed to the HEAD position
    if (!was_scrolling) this.advance_scroll()
  }

  /**
   * some user gesture (scrolling forward/button) has triggered
   * reSTREAMS_ONing to the head of the message feed
   */
  advance_scroll() {
    this._view.scrollTop = this._view.scrollHeight
    return this
  }

  wants(stream_name) {
    return StreamsSettings.get(
      `active.${stream_name}`,
      false
    )
  }

  redraw() {
    const container = document.querySelector(
      "#streams-wrapper"
    )
    if (!container) return // todo: maybe warn?
    container.innerHTML = ""
    container.appendChild(this._view)

    const active_streams = Object.entries(
      StreamsSettings.get("active", {})
    ).filter(([_, state]) => state)

    if (active_streams.length == 0) {
      return window.app.classList.remove(Streams.STREAMS_ON)
    }

    window.app.classList.add(Streams.STREAMS_ON)

    active_streams.forEach(([active]) =>
      this._view.classList.add(active)
    )
  }
}
