const m = require("mithril")
const Session = require("../../../session")
const Panel = require("./panel")
const Lens = require("../../../util/lens")
const Progress = require("../progress")

module.exports = class Stance {
  static PATTERN = /(\w+)\s\((\d+)%\)/

  static parse(text) {
    return text.match(Stance.PATTERN) || []
  }

  view() {
    const sess = Session.focused()
    if (!sess) return
    const stance = Lens.get(sess, "state.stance.text")
    if (!stance) return

    const [_, state, percent] = Stance.parse(stance)

    return m("li#vitals-stance", [
      m(`.bar.${Progress.classify(percent + 20)}`, {
        style: { width: percent + "%" },
      }),
      m(".value", [
        m("span", state),
        m("span", percent + "%"),
      ]),
    ])
  }
}
