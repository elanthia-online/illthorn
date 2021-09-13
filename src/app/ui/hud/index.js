const m = require("mithril")
const Settings = require("../../../settings").of("ui")
const Vitals = require("./vitals")
const Effects = require("./effects")
const Compass = require("./compass")
const Injuries = require("./injuries")

module.exports = class HUD {
  view() {
    return [
      Settings.get("vitals", true) && m(Vitals),
      Settings.get("injuries", true) && m(Injuries),
      Settings.get("effects", true) &&
        m(Effects, { dialog: "Active Spells" }),
      Settings.get("effects", true) && m(Effects, { dialog: "Cooldowns" }),
      Settings.get("effects", true) && m(Effects, { dialog: "Buffs" }),
      Settings.get("effects", true) && m(Effects, { dialog: "Debuffs" }),
      Settings.get("compass", true) && m(Compass),
    ]
  }
}
