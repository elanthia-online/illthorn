const m = require("mithril")
const Session = require("../../../session")
const Panel = require("./panel")
const Lens = require("../../../util/lens")
const Progress = require("../progress")
const Attrs = Lens.of("attrs")
const SpellDetails = require("../../../constants/spells")

module.exports = class ActiveSpells {
  static MAX_DURATION = 4 * 60 + 10

  static minutes_left(spell) {
    const [hours, minutes] = spell.remaining.split(":")
    return parseInt(hours, 10) * 60 + parseInt(minutes, 10)
  }

  static percent_remaining(spell) {
    return (
      (ActiveSpells.minutes_left(spell) /
        ActiveSpells.MAX_DURATION) *
      100
    )
  }

  static spell(spell) {
    const percent = ActiveSpells.percent_remaining(spell)
    const spellDetails = SpellDetails(spell)

    return m(
      "li",
      {
        ["data-spell-name"]: spellDetails.name,
        ["data-spell-type"]: spellDetails.type,
        ["data-spell-number"]: spellDetails.number,
        class: `${Progress.classify(percent + 20)}`,
      },
      [
        m(".value", [
          m("span.spell", spell.name),
          m("span.remaining", spell.remaining),
        ]),
      ]
    )
  }

  static list(spells) {
    return m(
      `ol.spells.panel-list`,
      spells.map(ActiveSpells.spell)
    )
  }

  static spells() {
    return [].slice
      .call(
        Lens.get(
          Session.focused(),
          "state.ActiveSpells.children",
          []
        )
      )
      .filter((_, i) => i % 2 == 1)
      .map(Attrs.get)
      .map((attrs) => ({
        name: attrs.anchor_right,
        remaining: attrs.value,
      }))
  }

  view() {
    return m(
      Panel,
      { id: "active-spells", title: "active spells" },
      ActiveSpells.list(ActiveSpells.spells())
    )
  }
}
