const m = require("mithril")
const Session = require("../../../session")
const Lens = require("../../../util/lens")
const Progress = require("../progress")
const Panel = require("./panel")
const Stance = require("./stance")

const span = (text, klass = "") =>
  m(`span.${klass}`, (text || "").toString().toLowerCase())

const attr = (ele, attr, fallback) =>
  Lens.get(ele, `attributes.${attr}.value`, fallback)

module.exports = class Vitals {
  // https://rubular.com/r/ydjHinB5kdvw8l
  static PATTERN = /^(\w+) ([-\d]+)\/(\d+)/

  static SORT_ORDER = [
    "spirit",
    "health",
    "mana",
    "stamina",
    "encumlevel",
    "mindState",
    "nextLvlPB",
  ]

  static ID_TO_UI = {
    encumlevel: "encumbrance",
    mindState: "mind",
    nextLevelPB: "exp",
    nextLvlPB: "exp",
  }

  static parse(ele) {
    const text = attr(ele, "text", "")
    const [_0, title, value, max] =
      text.match(Vitals.PATTERN) || []

    const parsed = {
      id: attr(ele, "id"),
      max: parseInt(max || "100", 10),
      value: parseInt(value || attr(ele, "value", "0"), 10),
      text: text,
      title: title || text,
    }

    if (typeof parsed.value == "number") {
      parsed.percent = Math.round(
        (Math.max(parsed.value, 0) / parsed.max) * 100
      )
      return Vitals.classify(parsed)
    }
    return {}
  }

  static classify(vital) {
    return Object.assign(vital, {
      threshold: (vital.threshold =
        vital.id == "encumlevel" || vital.id == "mindState"
          ? Progress.classify_down(vital.percent)
          : Progress.classify(vital.percent)),
    })
  }

  static show(attrs) {
    return m(
      `li#vitals-${attrs.id}.${attrs.threshold}.vital`,
      { key: attrs.id },
      [
        attrs.title && span(attrs.title, ".label"),
        attrs.value && m("span.value", attrs.value),
        isNaN(attrs.max)
          ? void 0
          : m("span.max", attrs.max),
      ]
    )
  }

  static bars(state) {
    return (
      state &&
      m(
        `ol.vitals.panel-list`,
        state
          .by_name("progressbar")
          .sort(
            (a, b) =>
              Vitals.SORT_ORDER.indexOf(attr(a, "id")) -
              Vitals.SORT_ORDER.indexOf(attr(b, "id"))
          )
          .map(Vitals.parse)
          .map(Vitals.show)
          .concat(m(Stance))
      )
    )
  }

  view() {
    return m(
      Panel,
      { id: "vitals", title: "vitals" },
      Vitals.bars(Lens.get(Session.current, "state"))
    )
  }
}
