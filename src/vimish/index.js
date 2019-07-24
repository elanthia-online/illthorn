

const Command    = require("./command")
const Session    = require("../session")
const Bus        = require("../bus")
const Autodetect = require("../autodetect")
const Lens       = require("../util/lens")
const Settings   = require("../settings")
const Hilites    = require("../hilites")
const Macros     = require("../macros")

const redraw = (session)=> {
  Bus.emit(Bus.events.FOCUS, session)
  Bus.emit(Bus.events.REDRAW)
}
/**
 * for sudo actions
 */
exports.sudo = Command.of(["command"], async (opts, argv)=> {
  const command = opts.command[0] == ":" ? opts.command.slice(1) : opts.command
  const cmd = exports[command] 
  if (cmd) return cmd.run(argv, true)
  throw new Error(`:${opts.command} not found`)
})
/**
 * connect to a session
 */
exports.connect = exports.c = Command.of(["name", "port"], async (argv) => {
  // connect to all the sessions
  if (!argv.port && !argv.name) {
    return await Autodect.connect_all()
  }

  console.log(argv)
  // attempt to autodetect what port to connect to
  if (!argv.port) {
    const running = await Autodetect.list()

    const auto_detected = running.find(({name})=> ~name.indexOf(argv.name)) || {}

    Object.assign(argv, auto_detected)
  }

  if (Session.has(argv.name)) {
    throw new Error(`Session(name: ${argv.name}) already exists`)
  }

  if (Session.find(sess => sess.port.toString() == argv.port.toString())) {
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

  Settings.set("focus", candidates[0].name)

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

exports.hilite = exports.hilites = exports.hilight = Command.of(["sub_command"], async (opts, rest, sudo)=> {
  if (opts.sub_command == "add") {
    let [group, ...pattern] = rest
    pattern = pattern.join(" ")
    if (!pattern || pattern.length == 0) {throw new Error(":hilite add <pattern> <group> was missing pattern")}
    if (!group)   {throw new Error(":hilite add <pattern> <group> was missing group")}
    return Hilites.add_pattern(group, pattern)
  }
  
  if ((opts.sub_command == "rm" || opts.sub_command == "remove") && sudo) {
    throw new Error(":hilite remove not implemented yet")
    // todo: sudo ?
  }

  if (opts.sub_command == "rm" || opts.sub_command == "remove") {
    throw new Error(":sudo is required for :hilite rm")
  }

  if (opts.sub_command == "reload") {
    return Hilites.reload()
  }

  if (opts.sub_command == "group") {
    const [group, ...rules] = rest

    if (!rules.length) { throw new Error(`:hilite group <group> ...<rules> requires at least 1 rule`) }

    return Hilites.add_group(group, rules.map(rule => rule.split("="))
      .reduce((acc, [rule, value])=> Object.assign(acc, {[rule]: value}), {}))
  }

  throw new Error(`:hilite ${opts.sub_command} is not a valid subcommand`)
})

exports.macros = exports.macro = Command.of(["sub_command", "profile"], 
  async function ({sub_command, profile}, args) {
  
    if (sub_command == "use") {
      return Macros.set_context(profile)
    }
    
    const [combo, ...macro] = args

    if (!macro) throw new Error(":macros <sub_command> <profile> ...rest was missing a <profile>")

    if (sub_command == "add" || sub_command == "set") {
      return Macros.put(profile, combo, macro.join(" "))
    }

    if (sub_command == "rm") {
      return Macros.delete(profile, combo)
    }

    throw new Error(`:macros ${sub_command} is not a valid subcommand`)
  })