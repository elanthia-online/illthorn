import "./app/styles/app.scss"
import "./app/styles/themes/dark-king.scss"

const m = require("mithril")
const UI = require("./app/ui")
const Bus = require("./bus")
const Autodect = require("./autodetect")
const Session = require("./session")
const Macros = require("./macros")
const Theme = require("./storage/theme")
const Settings = require("./settings")

window.messages = window.messages || []

let theme = Settings.get("theme")
// TODO: Validate theme name
if (!theme) theme = "original"

theme && Theme.changeTheme({ theme }).then(() => {})

Bus.on(Bus.events.CHANGE_THEME, async (data) => {
  await Theme.changeTheme(data)
  document.body.classList.remove("loading")
})

m.mount(document.getElementById("sessions"), UI.Sessions)
m.mount(document.getElementById("hands-wrapper"), UI.Hands)
m.mount(document.getElementById("cli-wrapper"), UI.CLI)
m.mount(document.getElementById("hud"), UI.HUD)
m.mount(
  document.getElementById("flash-container"),
  UI.FlashMessage
)

Bus.on(Bus.events.FLASH, (message) => {
  message.ttl = message.ttl || Date.now() + 5000 // seconds
  window.messages.push(message)
  m.redraw()
})

Bus.on(Bus.events.ERR, (err) => {
  Bus.emit(Bus.events.FLASH, {
    message: err.message,
    kind: "error",
  })
})

Bus.on(Bus.events.REDRAW, () => {
  const sess = Session.focused()
  if (sess) sess.streams.redraw()
  m.redraw()
})

Bus.on(Bus.events.FOCUS, (session) => {
  //if (session.has_focus()) return session.idle()
  document.querySelector("title").innerText = session.name
  const wrapper = document.getElementById("feed-wrapper")
  wrapper.setAttribute("data-name", session.name)
  session.attach(wrapper)
  m.redraw()
})

Bus.on("macro", (macro) => {
  const cli = document.getElementById("cli")
  cli && UI.CLI.exec_macro(cli, macro)
})

window.addEventListener("resize", function () {
  const session = Session.focused()
  if (!session) return
  session.feed.reattach_head()
})

document.addEventListener(
  "keypress",
  UI.CLI.global_handlekeypress
)
document.addEventListener(
  "autocomplete/right",
  UI.CLI.autocomplete_right
)

document.addEventListener("click", (e) => {
  const target = e.target
  if (!target || target.tagName !== "D") return
  const cmd = target.getAttribute("cmd")
  if (
    cmd &&
    Session.current &&
    Settings.get("clickable", false)
  ) {
    Session.current.send_command(cmd, "click")
  }
})

Autodect.connect_all().catch((err) =>
  Bus.emit(Bus.events.ERR, err)
)

Macros.set_context()
