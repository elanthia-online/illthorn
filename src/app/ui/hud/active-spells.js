const m         = require("mithril")
const Character = require("../../../character")
const Panel     = require("./panel")
const Lens      = require("../../../util/lens")
const Progress  = require("../progress")
const Attrs     = Lens.of("attrs")

module.exports = class ActiveSpells {
  static MAX_DURATION = (4 * 60) + 10

  static minutes_left (spell) {
    const [hours, minutes] = spell.remaining.split(":")
    return (parseInt(hours, 10) * 60) + parseInt(minutes, 10)
  }

  static percent_remaining (spell) {
    return (ActiveSpells.minutes_left(spell) / ActiveSpells.MAX_DURATION) * 100
  }

  static spell (spell) {
    const percent = ActiveSpells.percent_remaining(spell)
  
    return m("li",
      [ m(`.bar.${Progress.classify(percent + 20)}`, {style: {width: percent + "%" }})
      , m(".value", [ m("span.spell", spell.name),  
                      m("span.remaining", spell.remaining)
                    ])
      ]) 
  }

  static list (spells) {
    return m(`ol.spells.scroll` , 
      spells.map(ActiveSpells.spell))
  }

  static spells () {
    return Lens.get(Character.get_active(), "state.ActiveSpells.children", [])
      .filter((_, i)=> i % 2 == 1)
      .map(Attrs.get)
      .map((attrs)=> ({name: attrs.anchor_right, remaining: attrs.value}))   
  }

  view () {
    return m(Panel, {id: "active-spells", title: "active spells"},  
      ActiveSpells.list(ActiveSpells.spells()))
  }
}