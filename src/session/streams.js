const StreamsSettings = require("../settings").of("streams")
const Lens = require("../util/lens")

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
    death: 1,
  }

  static Settings = StreamsSettings

  static of() {
    return new Streams()
  }

  constructor() {
    this._view = document.createElement("div")
    this._view.classList.add("streams", "scroll")
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

    const streamChannel = document.createElement("span")
    streamChannel.classList.add("stream-channel")
    const streamText = document.createElement("span")
    streamText.classList.add("stream-text")

    if (tag.text.trim().startsWith("[")) {
      // This is a chat message
      const messageRegEx = /^(\[.*?\])(.*)/
      const messageParts = messageRegEx.exec(tag.text)
      // [help]-GSIV:Gilderan: "ahh good to know"
      // [0] = [help]-GSIV:Gilderan: "ahh good to know"
      // [1] = [help]
      // [2] = -GSIV:Gilderan: "ahh good to know"
      streamChannel.setAttribute(
        "data-stream-channel",
        messageParts[1]
      )
      streamChannel.innerText = Lens.get(messageParts, "1")
      streamText.innerText = Lens.get(messageParts, "2")
    } else if (tag.text.trim().startsWith("*")) {
      // This is a death message
      streamChannel.innerText = "* "
      // For styling the *
      streamChannel.classList.add("death")
      // Remove the "* " from the rest of message so it doesn't repeat
      streamText.innerText = tag.text.trim().substring(2)
    } else {
      // Unknown stream message, just dump it in with empty channel
      streamText.innerText = tag.text
    }

    pre.append(streamChannel)
    pre.append(streamText)

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

    const active_streams = Object.entries(
      StreamsSettings.get("active", {})
    ).filter(([_, state]) => state)

    if (active_streams.length == 0) {
      return window.app.classList.remove(Streams.STREAMS_ON)
    }

    active_streams.forEach(([active]) =>
      this._view.classList.add(active)
    )

    window.app.classList.add(Streams.STREAMS_ON)

    if (this._view.parentElement) return
    // this code will only run the when the streams component
    // is attached to the DOM, not on subsequent redraws
    // this means it will preserve the current scroll state
    container.innerHTML = ""
    container.appendChild(this._view)
    this.advance_scroll()
  }
}
