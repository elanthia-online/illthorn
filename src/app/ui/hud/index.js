const m            = require("mithril")
const Settings     = require("../../../settings").of("ui")
const Vitals       = require("./vitals")
const ActiveSpells = require("./active-spells")
const Stance       = require("./stance")
const Compass      = require("./compass")

module.exports = class HUD {
  view () {
    return (
      [ Settings.get("vitals", true) && m(Vitals)
      , Settings.get("active-spells", true) && m(ActiveSpells)
      , Settings.get("compass", true) && m(Compass)
      ])
  }
}