const m = require("mithril")
const Session = require("../../../session")
const Panel = require("./panel")
const Lens = require("../../../util/lens")
const Pipe = require("../../../util/pipe")
const Progress = require("../progress")
const Attrs = Lens.of("attrs")

window.Injuries = module.exports = class Injuries {
  static list() {
    return m(
      "ol.panel-list",
      Injuries.injuries().map((injury) => {
        return m(
          `li.${injury.type}.severity-${injury.severity}`,
          [
            m(
              "span.injury-name",
              injury.name + " / " + injury.type
            ),
            m("span.invlue-severity", injury.severity),
          ]
        )
      })
    )
  }

  static injuries() {
    return Pipe.of(Session.current)
      .fmap(Lens.get, "state.injuries", {})
      .fmap(Object.values)
      .data.map(Attrs.get)
      .map((injury) =>
        Object.assign(
          {},
          {
            area: injury.id,
            type: injury.name
              .replace(/\d+/, "")
              .toLowerCase(),
            severity: parseInt(
              injury.name
                .toLowerCase()
                .replace(/^[a-z]+/, ""),
              10
            ),
            name: injury.id
              .replace(/([A-Z])/g, " $&")
              .toLowerCase(),
          }
        )
      )
      .filter((injury) => !isNaN(injury.severity))
  }

  view() {
    return m(
      Panel,
      { id: "injuries", title: "injuries" },
      Injuries.list()
    )
  }
}
