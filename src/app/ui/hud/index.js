const m            = require("mithril")
const Settings     = require("../../../settings").of("ui")
const Vitals       = require("./vitals")
const ActiveSpells = require("./active-spells")
const Compass      = require("./compass")
const Injuries     = require("./injuries")

module.exports = class HUD {
  view () {
    return (
      [ Settings.get("vitals", true) && m(Vitals)
      , Settings.get("injuries", true) && m(Injuries)
      , Settings.get("active-spells", true) && m(ActiveSpells)
      , Settings.get("compass", true) && m(Compass)
      ])
  }
}