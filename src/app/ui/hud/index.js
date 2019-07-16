const m            = require("mithril")
const Vitals       = require("./vitals")
const ActiveSpells = require("./active-spells")
const Settings     = require("../../../settings").of("ui")

module.exports = class HUD {
  view () {
    return (
      [ Settings.get("vitals", true) && m(Vitals)
      , Settings.get("active-spells", true) && m(ActiveSpells)
      ])
  }
}