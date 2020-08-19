const m = require("mithril")

module.exports = class FlashMessage {
  view() {
    // prune expired messages
    window.messages = window.messages.filter(
      (flash) => flash.ttl > Date.now()
    )
    if (window.messages.length == 0) return
    return window.messages.map(
      ({ kind = "info", message }) => {
        return m(`.flash.${kind}`, message)
      }
    )
  }
}
