// Wrapper for providing spell details to the active-spells hud

const Spells = require("./spells.json")

module.exports = (spell) => {
  let spellDetail
  switch (/^\d+$/.test(spell.name)) {
    case true:
      spellDetail = Spells.find(
        (obj) => obj.number == spell.name
      )
      break
    case false:
      spellDetail = Spells.find(
        (obj) => obj.name == spell.name
      )
      break
  }
  return spellDetail
}
