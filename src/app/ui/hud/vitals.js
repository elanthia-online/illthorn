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

    if (text.match(Vitals.PATTERN)) {
      text = Array.from(
        attrs.text.match(Vitals.PATTERN)
      ).slice(1, 3)
    }

    if (!Array.isArray(text)) {
      text = [
        Vitals.ID_TO_UI[attrs.id] ? attrs.text : "",
        percent.toString(),
      ]
    }

    return { percent, text, id: attrs.id }
  }

  static show(attrs) {
    const bar_klass =
      attrs.id == "encumlevel" ||
      attrs.id == "mindState" ||
      attrs.id == "nextLvlPB"
        ? Progress.classify_down(attrs.percent)
        : Progress.classify(attrs.percent)

    return m(`li#vitals-${attrs.id}`, { key: attrs.id }, [
      m(
        `.bar.${bar_klass}`,
        Lens.put({}, "style.width", attrs.percent + "%")
      ),
      m(
        `.value.${attrs.text.length > 1 ? "" : "center"}`,
        attrs.text.map(span)
      ),
    ])
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
