const m         = require("mithril")
const Character = require("../../character")
const Bus       = require("../../bus")

module.exports = class Sessions {
  static tab ([name, character]) {   
    return m(`li.${ character.is_active() ? "on" : "off" }`,
      {key: name, onclick: Bus.emit.bind(Bus, Bus.events.FOCUS, character) },
      m("span", name))
  }

  view () {
    return m("ol", Array.from(Character.Connected).map(Sessions.tab))
  }
}