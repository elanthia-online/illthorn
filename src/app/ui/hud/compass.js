const m         = require("mithril")
const Session   = require("../../../session")
const Panel     = require("./panel")
const Lens      = require("../../../util/lens")
const Progress  = require("../progress")

module.exports = class Compass {
  static DIRS =
    [ "", "up", ""
    , "nw", "n", "ne", 
    , "w" , "o", "e",
    , "sw", "s", "se", 
    , "", "down", ""
    ]

  static current () {
    return Lens.get(Session.current, "state.compass.children", [])
      .map(dir => Lens.get(dir, "attrs.value"))
      .filter(dir => typeof dir == "string")
      .reduce((acc, dir) => Object.assign(acc, {[dir]: 1}), {})
  }
  
  view () {
    const available_dirs = Compass.current()

    console.log(available_dirs)

    return m(Panel, {id: "compass", title: "compass"}, 
      m("ul", Compass.DIRS.map(dir => m("li", 
        {class: available_dirs[dir] ? "on" : "off"}, dir))))
  }
}