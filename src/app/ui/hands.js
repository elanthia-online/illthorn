const m = require("mithril")
const Session = require("../../session")
const Lens = require("../../util/lens")

module.exports = class Hands {
  static KINDS = ["left", "right", "spell"]

  static get_ui_text(hand, session) {
    return (
      Lens.get(session, ["state", hand, "innerText"]) ||
      Lens.get(session, ["state", hand, "attributes", "noun", "value"]) ||
      Hands.fallback(hand)
    )
  }

  static fallback(hand) {
    switch (hand) {
      case "spell":
        return "None"
      default:
        return "Empty"
    }
  }

  view() {
    const session = Session.current

    return (
      session &&
      m(
        "ol#hands",
        Hands.KINDS.map((hand) =>
          m(
            `li.hand#${hand}`,
            { key: hand },
            Hands.get_ui_text(hand, session)
          )
        )
      )
    )
  }
}
