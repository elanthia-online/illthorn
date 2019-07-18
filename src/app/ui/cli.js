const m       = require("mithril")
const Session = require("../../session")
const Vimish  = require("../../vimish")
const Lens    = require("../../util/lens")
const Bus     = require("../../bus")

module.exports = class CLI {
  static CONTROL_CHAR = ":"

  static parse ({value}) {
    if (value[0] == CLI.CONTROL_CHAR) return CLI.fe_cmd(value)
    CLI.game_cmd(value)
  }

  static async fe_cmd (raw) {
    const [command, ...argv] = raw.slice(1).split(" ")
    const impl = Vimish[command]
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

  static game_cmd (cmd) {
    const sess = Session.focused()
    if (!sess) return
    sess.send_command(cmd)
    sess.history.add(cmd)
    sess.history.seek(0)
  }

  static on_up_arrow (cli, session) {
    if (session.history.head() !== cli.value && session.history.index == 0) {
      session.history.add(cli.value)
      session.history.back()
    }
    session.history.write(cli)
    session.history.back()
  }

  static on_down_arrow (cli, session) {
    session.history.write(cli)
    session.history.forward()
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
    cli.focus()
    cli.value = cli.value + e.key
  }

  static is_macro (e) {
    return e.shiftKey || e.ctrlKey || e.metaKey || e.altKey
  }

  static handlekeypress (e) {
    const cli = document.getElementById("cli")
    if (!cli) return
    if (e.key == "Enter") return CLI.on_enter(cli, cli.value)

    const session = Session.focused()

    if (CLI.is_macro(e)) return // todo: handle macro

    switch (e.key) {
      case "ArrowUp"   : return session && CLI.on_up_arrow(cli, session)
      case "ArrowDown" : return session && CLI.on_down_arrow(cli, session)
      default          : 
        if (e.key.length == 1) { CLI.handle_input(cli, e) }   
    }
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