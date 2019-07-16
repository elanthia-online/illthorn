const m         = require("mithril")
const UI        = require("./app/ui")
const Bus       = require("./bus")
const Autodect  = require("./autodetect")
const Character = require("./character")

m.mount(document.getElementById("sessions"), UI.Sessions)
m.mount(document.getElementById("hands-wrapper"), UI.Hands) 
m.mount(document.getElementById("cli-wrapper"), UI.CLI) 
m.mount(document.getElementById("hud"), UI.HUD)

// todo: show flash message
Bus.on(Bus.events.ERR, console.error)

Bus.on(Bus.events.REDRAW, m.redraw)

Bus.on(Bus.events.FOCUS, character => {
  if (character.is_active()) return character.idle()
  document.querySelector("title").innerText = character.name
  character.attach(document.getElementById("feed-wrapper"))
})

window.addEventListener("resize", function () {
  const char = Character.get_active()
  if (!char) return
  char.feed.scroll_to_bottom()
})

Autodect.connect_all()
  .catch(err => Bus.emit(Bus.events.ERR, err))
