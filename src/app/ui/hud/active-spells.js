const m = require("mithril")
const Session = require("../../../session")
const Panel = require("./panel")
const Lens = require("../../../util/lens")
const Progress = require("../progress")
const SpellDetails = require("../../../constants/spells")
const Pipe = require("../../../util/pipe")
const Empty = document.createElement("div")

const selector = (ele, selector) =>
  ele.querySelectorAll(selector)

const attr = (ele, attr, fallback) =>
  Lens.get(ele, `attributes.${attr}.value`, fallback)

module.exports = class ActiveSpells {
  static MAX_DURATION = 4 * 60 + 10

  static minutes_left(remaining) {
    const [hours, minutes] = remaining.split(":")
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
    const name = attr(spell, "anchor_right", "")
    const remaining = attr(spell, "value", "")
    const percent = ActiveSpells.percent_remaining(
      remaining
    )
    const spellDetails = SpellDetails({ name }) || {}

    return m(
      "li",
      {
        ["data-spell-name"]: spellDetails.name,
        ["data-spell-type"]: spellDetails.type,
        ["data-spell-number"]: spellDetails.number,
        class: Progress.classify(percent + 20).toString(),
      },
      [
        m(".value", [
          m("span.spell", name),
          m("span.remaining", remaining),
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
    return Pipe.of(Session.current)
      .fmap(Lens.get, "state.ActiveSpells", Empty)
      .fmap(selector, "label")
      .fmap(Array.from)
      .unwrap()
  }

  view() {
    return m(
      Panel,
      { id: "active-spells", title: "active spells" },
      ActiveSpells.list(ActiveSpells.spells())
    )
  }
}
