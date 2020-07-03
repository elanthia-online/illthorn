const m = require("mithril");
const Session = require("../../../session");
const Panel = require("./panel");
const Lens = require("../../../util/lens");
const Progress = require("../progress");

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
  ];

  static MAP = { up: "u", down: "d", out: "o" };

  static current() {
    return Lens.get(Session.current, "state.compass.children", [])
      .map((dir) => Lens.get(dir, "attrs.value"))
      .filter((dir) => typeof dir == "string")
      .reduce((acc, dir) => {
        return Object.assign(acc, { [dir]: 1 });
      }, {});
  }

  view() {
    const available_dirs = Compass.current();

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
    );
  }
};
