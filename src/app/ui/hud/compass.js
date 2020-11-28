const m = require("mithril")
const Session = require("../../../session")
const Panel = require("./panel")
const Lens = require("../../../util/lens")
const DOM = require("../../../util/dom")
const Pipe = require("../../../util/pipe")
const Empty = document.createElement("pre")

module.exports = class Compass {
  static DIRS = [
    "",
    "up",
    "",
    "nw",
    "n",
    "ne",
    "w",
    "out",
    "e",
    "sw",
    "s",
    "se",
    "",
    "down",
    "",
  ]

  static MAP = { up: "u", down: "d", out: "o" }

  static current() {
    return Pipe.of(Session.current)
      .fmap(Lens.get, "state.compass", Empty)
      .fmap(DOM.map, "dir", (dir) => dir.attributes.value.textContent)
      .fmap((dirs) =>
        dirs.reduce((acc, dir) => Object.assign(acc, { [dir]: 1 }), {})
      ).data
  }

  view() {
    const available_dirs = Compass.current()
    return m(
      Panel,
      { id: "compass", title: "compass" },
      m(
        "ul",
        Compass.DIRS.map((dir) =>
          m(
            "li",
            { class: available_dirs[dir] ? "on" : "off" },
            Compass.MAP[dir] || dir
          )
        )
      )
    )
  }
}
