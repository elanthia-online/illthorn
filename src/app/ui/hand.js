const m         = require("mithril")
const Character = require("../../character")
const Lens      = require("../../util/lens")

module.exports = class Hand {
  view ({attrs}) {
    return m("span", 
      Lens.get(Character.get_active(), 
        ["state", attrs.kind, "text"], 
        "Empty"))
  }
}