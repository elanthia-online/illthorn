const m         = require("mithril")
const Session   = require("../../../session")
const Lens      = require("../../../util/lens")
const Progress  = require("../progress")
const Panel     = require("./panel")
const Attrs     = Lens.of("attrs")

const span = 
  text => m("span", (text || "").toString().toLowerCase())

module.exports = class Vitals {
  static PATTERN = /^(\w+) (\d+)\/(\d+)/

  static ID_TO_UI = 
    { encumlevel : "encumbrance"
    , mindState  : "mind"
    }

  static parse (attrs) {
    const percent = attrs.width 
      ? parseInt(attrs.value, 10) 
      : Progress.parse_percentage({text: attrs.text, attrs})

    let text = attrs.text

    if (text.match(Vitals.PATTERN)) {
      text = Array.from(attrs.text.match(Vitals.PATTERN)).slice(1, 3)
    }

    if (!Array.isArray(text)) {
      text = [Vitals.ID_TO_UI[attrs.id], percent.toString()]
    }

    return {percent, text, id: attrs.id}
  } 

  static show (attrs) {
    const bar_klass = attrs.id == "encumlevel" || attrs.id == "mindState"
      ? Progress.classify_down(attrs.percent)
      : Progress.classify(attrs.percent)

    return m(`li#vitals-${attrs.id}`, {key: attrs.id},
      [ m(`.bar.${bar_klass}`, Lens.put({}, "style.width", attrs.percent + "%"))
      , m(`.value`, attrs.text.map(span))
      ])
  }


  static bars (state) {
    return state && m(`ol` , 
      state.by_name("progressbar")
        .map(Attrs.get)
        .map(Vitals.parse)
        .map(Vitals.show))
  }

  view () {
    return m(Panel, {id: "vitals", title: "vitals"},
      Vitals.bars(
        Lens.get(Session.focused(), "state")))
  }
}