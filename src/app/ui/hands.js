const m         = require("mithril")
const Character = require("../../character")
const Lens      = require("../../util/lens")

module.exports = class Hands {
  static KINDS =
    [ "left"
    , "right"
    , "magic"
    ]

  static fallback (hand) {
    switch (hand) {
      case "magic": return "None"
      default     : return "Empty"
    }
  }

  view ({attrs}) {
    const char = Character.get_active()

    return m("ol#hands", Hands.KINDS.map(hand => m(`li.hand#${hand}`, 
      {key: hand},
      Lens.get(char, ["state", hand, "text"], Hands.fallback(hand)))))
  }
}