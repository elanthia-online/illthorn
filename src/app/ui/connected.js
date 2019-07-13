const m         = require("mithril")
const Character = require("../../character")
const Bus       = require("../../bus")

module.exports = class Connected {
  view () {
    return Array.from(Character.Connected).map(([name, character])=> {
      return m(`li.${ character.is_active() ? "on" : "off" }`, 
        {onclick: ()=> Bus.emit("character:focus", character) },
        m("span", name))
    })
  }
}