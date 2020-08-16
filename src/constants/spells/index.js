// Wrapper for providing spell details to the active-spells hud

const Spells = require("./spells.json")

module.exports = (spell) => {
  return /^\d+$/.test(spell.name)
    ? Spells.find((obj) => obj.number == spell.name)
    : Spells.find((obj) => obj.name == spell.name)
}
