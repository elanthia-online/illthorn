

const Command    = require("./command")
const Character  = require("../character")
const Bus        = require("../bus")
const Autodetect = require("../autodetect")

const redraw = (character)=> {
  Bus.emit(Bus.events.FOCUS, character)
  Bus.emit(Bus.events.REDRAW)
}
/**
 * connect to a session
 */
exports.connect = exports.c = Command.of(["name", "port"], async argv => {
  if (!argv.port && !argv.name) {
    return await Autodetect()
  }

  if (Character.Connected.has(argv.name)) {
    throw new Error(`Session(name: ${argv.name}) already exists`)
  }

  if (Array.from(Character.Connected).find(([_, char])=> char.port.toString() == argv.port.toString())) {
    throw new Error(`Session(port: ${argv.port}) already exists`)
  }

  const character = await Character.of(argv)
  redraw(character)
})
/**
 * rename the current attached session
 */
exports.rename = exports.r = Command.of(["name"], ({name}) => {
  const character = Character.get_active()
  character && character.rename(name)
})
/**
 * focus on a session, will loosely match
 */
exports.focus = exports.f = Command.of(["name"], ({name}) => {
  const candidates = Array.from(Character.Connected).filter(([active, _])=> ~active.indexOf(name))

  if (candidates.length > 1) {
    throw new Error(`Ambigious match for name(${name}) found ${candidates.length} matches`)
  }

  if (candidates.length == 0) {
    throw new Error(`No matches found for name(${name})`)
  }

  const [_, character] = candidates[0]
  redraw(character)
})
/**
 * swap two session names if you accidentally got them wrong
 */
exports.swap = Command.of(["other"], ({other})=> {
  const focused = Character.get_active()
  
  if (!focused) {
    throw new Error("Cannot swap names without an active session")
  }

  if (!Character.Connected.has(other)) {
    throw new Error(`No sessions named ${other} were found to swap with`)
  }

  const swap       = Math.random().toString(13).replace('0.', '')
  const this_name  = focused.name
  focused.rename(swap)
  Character.Connected.get(other).rename(this_name)
  focused.rename(other)
  Bus.emit(Bus.events.REDRAW)
})