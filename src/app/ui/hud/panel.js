const m          = require("mithril")
const Character  = require("../../../character")
const Lens       = require("../../../util/lens")
const Settings   = require("../../../settings").of("ui")

module.exports = class Panel {
  static toggle (id) {
    return Settings.set(id, 
      !Settings.get(id))
  }

  view ({attrs, children}) {
    const state = Lens.get(Character.get_active(), "state")

    if (state) return m(`.panel#${attrs.id}`,
      [ m("h3", {onclick: ()=> Panel.toggle(attrs.id) }, attrs.title)
      , children
      ])
  }
}