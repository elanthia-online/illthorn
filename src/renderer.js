const m   = require("mithril")
const UI  = require("./app/ui")
const Bus = require("./bus")
const Autodect = require("./autodetect")

m.mount(document.getElementById("characters"),  UI.Connected)
m.mount(document.getElementById("cli-wrapper"), UI.CLI)

Bus.on("redraw", m.redraw)

Bus.on("character:focus", (character) => {
  if (character.is_active()) return character.idle()
  character.attach(document.getElementById("feed-wrapper"))
})


Autodect().catch(console.error)
