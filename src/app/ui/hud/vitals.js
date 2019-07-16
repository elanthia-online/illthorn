const m         = require("mithril")
const Character = require("../../../character")
const Lens      = require("../../../util/lens")
const Progress  = require("../progress")
const Panel     = require("./panel")
const Attrs     = Lens.of("attrs")

const span = 
  text => m("span", text)

module.exports = class Vitals {
  static PATTERN = /^(\w+) (\d+)\/(\d+)/

  static parse (attrs) {
    const percent = attrs.width 
      ? parseInt(attrs.value) 
      : Progress.parse_percentage(attrs)

    let text = attrs.text

    if (text.match(Vitals.PATTERN)) {
      text = Array.from(attrs.text.match(Vitals.PATTERN)).slice(1, 3)
    }

    if (!Array.isArray(text)) {
      text = [text]
    }

    return {percent, text}
  } 

  static show (attrs) {
    return m(`li`, 
      [ m(`.bar.${Progress.classify(attrs.percent)}`, Lens.put({}, "style.width", attrs.percent + "%"))
      , m(".value", attrs.text.map(span))
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
        Lens.get(Character.get_active(), "state")))
  }
}