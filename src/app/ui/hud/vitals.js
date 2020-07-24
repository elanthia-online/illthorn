const m = require("mithril")
const Session = require("../../../session")
const Lens = require("../../../util/lens")
const Progress = require("../progress")
const Panel = require("./panel")
const Attrs = Lens.of("attrs")
const Stance = require("./stance")

const span = (text, klass = "") =>
  m(`span.${klass}`, (text || "").toString().toLowerCase())

module.exports = class Vitals {
  static PATTERN = /^(\w+) (\d+)\/(\d+)/

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

  static parse(attrs) {
    /* attrs:
    {
      id: "health"
      text: "health 170/170"
      value: "0"
    }
    */
    const percent = attrs.width
      ? parseInt(attrs.value, 10)
      : Progress.parse_percentage({
          text: attrs.text,
          attrs,
        })

    if (attrs.id == "nextLvlPB") {
      return {
        id: attrs.id,
        text: [
          attrs.text
            .split("\n")
            .shift()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        ],
        percent,
      }
    }

    let text = attrs.text
    let max = 0

    // e.g. health 170/170
    if (text.match(Vitals.PATTERN)) {
      text = Array.from(
        attrs.text.match(Vitals.PATTERN)
      ).slice(1, 3)
      max = Array.from(attrs.text.match(Vitals.PATTERN))[3]
    }
    // turns into ["health", "170"]

    if (!Array.isArray(text)) {
      text = [
        Vitals.ID_TO_UI[attrs.id] ? attrs.text : "",
        percent.toString(),
      ]
    }

    return { percent, text, max, id: attrs.id }
  }

  static show(attrs) {
    const bar_klass =
      attrs.id == "encumlevel" ||
      attrs.id == "mindState" ||
      attrs.id == "nextLvlPB"
        ? Progress.classify_down(attrs.percent)
        : Progress.classify(attrs.percent)

    const [text, value] = attrs.text

    return m(
      `li#vitals-${attrs.id}.${bar_klass}.vital`,
      { key: attrs.id },
      [
        text && span(text, ".label"),
        value && m("span.value", value),
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
          .map(Attrs.get)
          .sort(
            (a, b) =>
              Vitals.SORT_ORDER.indexOf(a.id) -
              Vitals.SORT_ORDER.indexOf(b.id)
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
      Vitals.bars(Lens.get(Session.focused(), "state"))
    )
  }
}
