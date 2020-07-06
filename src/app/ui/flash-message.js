const m = require("mithril")
const Session = require("../../session")
const Lens = require("../../util/lens")

module.exports = class FlashMessage {
  view() {
    // prune expired messages
    window.messages = window.messages.filter(
      (flash) => flash.ttl > Date.now()
    )
    console.log(window.messages)
    if (window.messages.length == 0) return
    return window.messages.map((flash) =>
      m(".flash", flash.message)
    )
  }
}
