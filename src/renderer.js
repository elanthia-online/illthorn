const m   = require("mithril")
const UI  = require("./app/ui")
const Bus = require("./bus")
const Autodect = require("./autodetect")

m.mount(document.getElementById("characters"),  
  UI.Connected)
m.mount(document.getElementById("cli-wrapper"), 
  UI.CLI)
m.mount(document.getElementById("right-hand"), 
  { view: _=> m(UI.Hand, {kind: "right"}) 
  })
m.mount(document.getElementById("left-hand"), 
  { view: _=> m(UI.Hand, {kind: "left"}) 
  })
m.mount(document.getElementById("spell-hand"), 
  { view: _=> m(UI.Hand, {kind: "spell"}) 
  })

Bus.on(Bus.events.REDRAW, m.redraw)

Bus.on(Bus.events.FOCUS, character => {
  if (character.is_active()) return character.idle()
  character.attach(document.getElementById("feed-wrapper"))
})

Bus.on(Bus.events.ERR, err => {
  console.error(err)
})

Autodect.connect_all()
  .catch(err => Bus.emit(Bus.events.ERR, err))
