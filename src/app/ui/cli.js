const m       = require("mithril")
const Session = require("../../session")
const Vimish  = require("../../vimish")
const Lens    = require("../../util/lens")
const Bus     = require("../../bus")
const Macros  = require("../../macros")

module.exports = class CLI {
  static CONTROL_CHAR = ":"

  static parse ({value}) {
    if (value[0] == CLI.CONTROL_CHAR) return CLI.fe_cmd(value)
    CLI.game_cmd(value)
  }

  static async fe_cmd (raw) {
    const [command, ...argv] = raw.slice(1).split(" ")
    const impl = Vimish[command.toLowerCase()]
    try {
      if (!impl) {
        throw new Error(`:${command} is not a valid command`)
      }

      await impl.run(argv)
    } catch (err) {
      Bus.emit(Bus.events.ERR, 
        { message : err.message
        , kind    : "error"
        })
      // todo: show flash message
      console.log(err)
    }
  }

  static game_cmd (cmd, id) {
    const sess = Session.focused()
    if (!sess) return
    sess.send_command(cmd, id)
    sess.history.add(cmd)
    sess.history.seek(0)
  }

  static on_enter (cli, val) {
    cli.value = ""
    const session = Session.focused()
    session && session.history.update(val)

    return CLI.parse(
      { target: cli
      ,  value: val
      })
  }

  static handle_input (cli, e) {
    if (document.activeElement == cli) return
    cli.value = cli.value + e.key
  }

  static is_macro (e) {
    return e.ctrlKey || e.metaKey || e.altKey
  }

  static exec_macro (cli, macro) {
    const replacement = macro.indexOf("\?")
    if (!~replacement) {
      return macro.trim().split(/\r|\n/g)
        .map(cmd => cmd.trim())
        .forEach(cmd=> cmd.length && CLI.game_cmd(cmd, "macro"))
    }
    cli.value = macro
    cli.focus()
    cli.setSelectionRange(replacement-1, replacement + "\?".length)
  }

  static handlekeypress (e) {
    const cli = document.getElementById("cli")
    if (!cli) return
    if (e.key == "Enter") return CLI.on_enter(cli, cli.value)
    if (CLI.is_macro(e)) return
    return cli.focus()
  }

  view () {
    return (
      [ m("span.prompt", Lens.get(Session.focused(), "state.prompt.text", ">"))
      , m("#cnc", [ m("input#cli", { autofocus : true })
                  , m("input#cli-suggestions")
                  ])
      ])
  }
}