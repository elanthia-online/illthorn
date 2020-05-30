const m        = require("mithril")
const UI       = require("./app/ui")
const Bus      = require("./bus")
const Autodect = require("./autodetect")
const Session  = require("./session")
const Macros   = require("./macros")
const CustomCSS = require("./storage/custom-css")

CustomCSS.injectCSS()

m.mount(document.getElementById("sessions"), UI.Sessions)
m.mount(document.getElementById("hands-wrapper"), UI.Hands) 
m.mount(document.getElementById("cli-wrapper"), UI.CLI) 
m.mount(document.getElementById("hud"), UI.HUD)

// todo: show flash message
Bus.on(Bus.events.ERR, console.error)

Bus.on(Bus.events.REDRAW, m.redraw)

Bus.on(Bus.events.FOCUS, session => {
  //if (session.has_focus()) return session.idle()
  document.querySelector("title").innerText = session.name
  session.attach(document.getElementById("feed-wrapper"))
  m.redraw()
})

Bus.on("macro", macro => {
  const cli = document.getElementById("cli")
  cli && UI.CLI.exec_macro(cli, macro)
})

window.addEventListener("resize", function () {
  const session = Session.focused()
  if (!session) return
  session.feed.reattach_head()
})

document.addEventListener("keypress", UI.CLI.global_handlekeypress)
document.addEventListener("autocomplete/right", UI.CLI.autocomplete_right)

Autodect.connect_all()
  .catch(err => Bus.emit(Bus.events.ERR, err))

Macros.set_context()