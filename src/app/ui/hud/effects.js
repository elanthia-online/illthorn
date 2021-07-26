const m = require("mithril")
const Session = require("../../../session")
const Panel = require("./panel")
const Lens = require("../../../util/lens")
const Progress = require("../progress")
const effectDetails = require("../../../constants/spells")
const Pipe = require("../../../util/pipe")
const Empty = document.createElement("div")

const selector = (ele, selector) => ele.querySelectorAll(selector)

const attr = (ele, attr, fallback) =>
  Lens.get(ele, `attributes.${attr}.value`, fallback)

module.exports = class Effects {
  static MAX_DURATION = 4 * 60 + 10

  static minutes_left(remaining) {
    const [hours, minutes, seconds] = remaining.split(":")
    return parseInt(hours, 10) * 60 + parseInt(minutes, 10)
  }

  static percent_remaining(duration) {
    if (duration.toLowerCase() == "indefinite") {
      return 100
    }

    return (Effects.minutes_left(duration) / Effects.MAX_DURATION) * 100
  }

  static effectRow(effect) {
    const effectName = attr(effect, "text", "")
    const remaining = attr(effect, "time", "")
    const effectNum = attr(effect, "class", "")
    const percent = Effects.percent_remaining(remaining)

    const rowAttrs = {
      ["data-effect-name"]: effectName,
      ["data-effect-number"]: effectNum,
      class: Progress.classify(percent + 20).toString(),
    }

    return m("li", rowAttrs, [
      m(".value", [
        m("span.effect", effectName),
        m("span.remaining", remaining),
      ]),
    ])
  }

  constructor({ attrs }) {
    this.dialog = attrs.dialog
    this.id = this.dialog.toLowerCase().replace(/\s/, "-")
  }

  effects() {
    return Pipe.of(Session.current)
      .fmap(Lens.get, `state.${this.dialog}`, Empty)
      .fmap(selector, "progressbar")
      .fmap(Array.from)
      .unwrap()
  }

  view() {
    return m(
      Panel,
      { id: this.id, title: this.dialog },
      m(`ol.effects.panel-list`, this.effects().map(Effects.effectRow))
    )
  }
}
