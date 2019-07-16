const m         = require("mithril")
const Character = require("../../character")
const Vimish    = require("../../vimish")
const Lens      = require("../../util/lens")

module.exports = class CLI {
  static CONTROL_CHAR = ":"

  static parse ({target, value}) {
    target.value = ""
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
      // todo: show flash message
      console.log(err)
    }
  }

  static game_cmd (cmd) {
    const char = Character.get_active()
    if (!char) return
    char.send_command(cmd)
  }

  static onkeyup (e) {
    if (e.key == "Enter") {
      return CLI.parse(
        { target: e.target
        ,  value: e.target.value
        })
    }

    const char = Character.get_active()
    if (!char) return
    //console.log("CLI(%s)", e.target.value)
    char.history.update(e.target.value)
  }

  view () {
    return [
      m("span.prompt", Lens.get(Character.get_active(), "state.prompt.text", ">"))
    , m("input#cli", 
        { onkeyup : CLI.onkeyup
        , autofocus  : true
        })
    ]
  }
}