const m = require("mithril")
const Session = require("../../../session")
const Lens = require("../../../util/lens")
const Progress = require("../progress")
const Panel = require("./panel")
const _pp = require("debug")("illthorn:vitals")

const span = (text, klass = "") =>
  m(`span.${klass}`, text.toString().toLowerCase())

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
    "pbarStance",
  ]

  // List of stances in percentage order.
  // Used for fixing the title on startup.
  static STANCE_ORDER = [
    "offensive",
    "advance",
    "forward",
    "neutral",
    "guarded",
    "defensive",
  ]

  static ID_TO_UI = {
    encumlevel: "encumbrance",
    mindState: "mind",
    nextLevelPB: "exp",
    nextLvlPB: "exp",
    pbarstance: "stance",
  }

  static parse(ele) {
    const text = attr(ele, "text", attr(ele, "id"))
    const [_0, title, value, max] = text.match(Vitals.PATTERN) || []
    const parsed = {
      id: ele.className,
      max: parseInt(max || "100", 10),
      value: parseInt(value || attr(ele, "value", "0"), 10),
      text: text,
      title: (title || text).replace(/\s\(\d+%\)/, ""),
    }

    //pp("%s -> %o -> %o", parsed.id, ele, parsed)

    if (parsed.id == "nextLvlPB") {
      const exp = (parsed.title.match(/(\d+)/) || [])[1]
      parsed.value = parseInt(exp, 10)
      parsed.title = parsed.title.replace(exp, "").trim()
      return parsed
    }

    // At startup, the text may not be present. This fixes the title in that case.
    if (parsed.title == "pbarStance") {
      // Make sure that finer stance gradations don't produce incorrect indices.
      const index = Math.floor(parsed.value / 20)
      parsed.title = Vitals.STANCE_ORDER[index]
    }

    parsed.value = typeof parsed.value == "number" ? parsed.value : 0

    if (typeof parsed.value == "number") {
      parsed.percent = Math.round(
        (Math.max(parsed.value, 0) / parsed.max) * 100
      )

      parsed.value = parsed.value || parsed.percent
      parsed.max = parsed.max || 100
      Vitals.classify(parsed)
      return parsed
    }

    return parsed
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
        span(attrs.title, ".label"),
        span(attrs.value, ".value"),
        isNaN(attrs.max) ? void 0 : m("span.max", attrs.max),
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
