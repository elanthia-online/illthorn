

const Command    = require("./command")
const Session    = require("../session")
const Bus        = require("../bus")
const Autodetect = require("../autodetect")
const Lens       = require("../util/lens")
const Settings   = require("../settings")

const redraw = (session)=> {
  Bus.emit(Bus.events.FOCUS, session)
  Bus.emit(Bus.events.REDRAW)
}
/**
 * connect to a session
 */
exports.connect = exports.c = Command.of(["name", "port"], async argv => {
  // connect to all the sessions
  if (!argv.port && !argv.name) {
    return await Autodect.connect_all()
  }
  // attempt to autodetect what port to connect to
  if (!argv.port) {
    const running = await Autodetect.list()

    const auto_detected = running.find(({name})=> ~name.indexOf(argv.name)) || {}

    Object.assign(argv, auto_detected)
  }

  if (Session.has(argv.name)) {
    throw new Error(`Session(name: ${argv.name}) already exists`)
  }

  if (Array.from(Session.Connected).find(([_, char])=> char.port.toString() == argv.port.toString())) {
    throw new Error(`Session(port: ${argv.port}) already exists`)
  }

  const session = await Session.of(argv)
  redraw(session)
})
/**
 * rename the current attached session
 */
exports.rename = exports.r = Command.of(["name"], ({name}) => {
  const session = Session.focused()
  session && session.rename(name)
})
/**
 * focus on a session, will loosely match
 */
exports.focus = exports.f = Command.of(["name"], ({name}) => {
  const candidates = Session.fuzzy_find(name)

  console.log("Candidates(%o)", candidates)

  if (candidates.length > 1) {
    throw new Error(`Ambigious match for name(${name}) found ${candidates.length} matches`)
  }

  if (candidates.length == 0) {
    throw new Error(`No matches found for name(${name})`)
  }

  redraw(candidates[0])
})
/**
 * swap two session names if you accidentally got them wrong
 */
exports.swap = Command.of(["other"], ({other})=> {
  const focused = Session.focused()
  
  if (!focused) {
    throw new Error("Cannot swap names without an active session")
  }

  if (!Session.has(other)) {
    throw new Error(`No sessions named ${other} were found to swap with`)
  }

  const swap       = Math.random().toString(13).replace('0.', '')
  const this_name  = focused.name
  focused.rename(swap)
  Session.get(other).rename(this_name)
  focused.rename(other)
  Bus.emit(Bus.events.REDRAW)
})

exports.quit = exports.q = Command.of(["name"], async ({name})=> {
  if (!name) {
    name = Lens.get(Session.focused(), "name")
  }

  const candidates = Session.fuzzy_find(name)

  if (candidates.length > 1) {
    throw new Error(`Ambigious match for name(${name}) found ${candidates.length} matches`)
  }

  if (candidates.length == 0) {
    throw new Error(`No matches found for name(${name})`)
  }

  candidates[0].destroy()
})

exports.ui = Command.of(["component", "state"], async ({component, state}) => {
  Settings.set(`ui.${component}`, state)
  Bus.emit(Bus.events.REDRAW)
})

exports.compiler = Command.of(["option", "value"], async ({option, value})=> {
  if (option == "off") {
    option = "run"
    value  = false
  }

  if (option == "on") {
    option = "run"
    value  = true
  }

  Settings.set(`compiler.${option}`, value)
})