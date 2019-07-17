const m        = require("mithril")
const UI       = require("./app/ui")
const Bus      = require("./bus")
const Autodect = require("./autodetect")
const Session  = require("./session")

m.mount(document.getElementById("sessions"), UI.Sessions)
m.mount(document.getElementById("hands-wrapper"), UI.Hands) 
m.mount(document.getElementById("cli-wrapper"), UI.CLI) 
m.mount(document.getElementById("hud"), UI.HUD)

// todo: show flash message
Bus.on(Bus.events.ERR, console.error)

Bus.on(Bus.events.REDRAW, m.redraw)

Bus.on(Bus.events.FOCUS, session => {
  if (session.has_focus()) return session.idle()
  document.querySelector("title").innerText = session.name
  session.attach(document.getElementById("feed-wrapper"))
})

window.addEventListener("resize", function () {
  const session = Session.focused()
  if (!session) return
  session.feed.scroll_to_bottom()
})

document.addEventListener("keyup", UI.CLI.handlekeypress)

Autodect.connect_all()
  .catch(err => Bus.emit(Bus.events.ERR, err))
