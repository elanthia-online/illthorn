const m = require("mithril")
const Session = require("../../../session")
const Panel = require("./panel")
const Lens = require("../../../util/lens")
const Pipe = require("../../../util/pipe")

const attr = (ele, attr, fallback) =>
  Lens.get(ele, `attributes.${attr}.value`, fallback)

window.Injuries = module.exports = class Injuries {
  static list() {
    return m(
      "ol.panel-list",
      Injuries.injuries().map((injury) => {
        return m(`li.${injury.type}.severity-${injury.severity}`, [
          m("span.injury-name", injury.name + " / " + injury.type),
          m("span.injury-severity", injury.severity),
        ])
      })
    )
  }

  static injuries() {
    return Pipe.of(Session.current)
      .fmap(Lens.get, "state.injuries", {})
      .fmap(Object.values)
      .unwrap()
      .map((injury) =>
        Object.assign(
          {},
          {
            area: attr(injury, "id", injury.className),
            type: attr(injury, "name", "")
              .replace(/\d+/, "")
              .toLowerCase(),
            severity: parseInt(
              attr(injury, "name", "")
                .toLowerCase()
                .replace(/^[a-z]+/, ""),
              10
            ),
            name: attr(injury, "id", injury.className)
              .replace(/([A-Z])/g, " $&")
              .toLowerCase(),
          }
        )
      )
      .filter((injury) => !isNaN(injury.severity))
  }

  view() {
    return m(Panel, { id: "injuries", title: "injuries" }, Injuries.list())
  }
}
