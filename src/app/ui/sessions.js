const m         = require("mithril")
const Session = require("../../session")
const Bus       = require("../../bus")

module.exports = class SessionsList {
  static tab (session) {   
    return m(`li.${ session.has_focus() ? "on" : "off" }`,
      {key: name, onclick: Bus.emit.bind(Bus, Bus.events.FOCUS, session) },
      m("span", session.name))
  }

  view () {
    return m("ol", Session.list().map(SessionsList.tab))
  }
}