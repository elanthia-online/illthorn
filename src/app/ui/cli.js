const m = require("mithril")
const Session = require("../../session")
const Vimish = require("../../vimish")
const Lens = require("../../util/lens")
const Bus = require("../../bus")
const Macros = require("../../macros")

module.exports = class CLI {
  static CONTROL_CHAR = ":"

  static parse({ value }) {
    if (value[0] == CLI.CONTROL_CHAR)
      return CLI.fe_cmd(value)
    CLI.game_cmd(value)
  }

  static async fe_cmd(raw) {
    const [command, ...argv] = raw.slice(1).split(" ")
    const impl = Vimish[command.toLowerCase()]
    try {
      if (!impl) {
        throw new Error(
          `:${command} is not a valid command`
        )
      }

      await impl.run(argv)
    } catch (err) {
      Bus.emit(Bus.events.ERR, {
        message: err.message,
        kind: "error",
      })
      // todo: show flash message
      console.log(err)
    }
  }

  static game_cmd(cmd, id) {
    const sess = Session.focused()
    if (!sess) return
    sess.send_command(cmd, id)
    sess.history.seek(0)
    sess.history.add(cmd)
  }

  static on_enter(cli, val) {
    const suggestion = document.getElementById(
      "cli-suggestions"
    )
    if (suggestion) suggestion.placeholder = ""
    cli.value = ""
    const session = Session.focused()
    session && session.history.update(val)

    return CLI.parse({ target: cli, value: val })
  }

  static handle_input(cli, e) {
    if (document.activeElement == cli) return
    cli.value = cli.value + e.key
  }

  static is_macro(e) {
    return e.ctrlKey || e.metaKey || e.altKey
  }

  static exec_macro(cli, macro) {
    const replacement = macro.indexOf("?")
    if (!~replacement) {
      return macro
        .trim()
        .split(/\r|\n/g)
        .map((cmd) => cmd.trim())
        .forEach(
          (cmd) => cmd.length && CLI.game_cmd(cmd, "macro")
        )
    }
    cli.value = macro
    cli.focus()
    cli.setSelectionRange(
      replacement - 1,
      replacement + "?".length
    )
  }

  static global_handlekeypress(e) {
    const cli = document.getElementById("cli")
    if (!cli || CLI.is_macro(e)) return
    if (e.key == "Enter")
      return CLI.on_enter(cli, cli.value)
    cli.focus()
  }

  static autocomplete_right(e) {
    requestAnimationFrame(function () {
      const cli = document.getElementById("cli")
      const suggestion = document.getElementById(
        "cli-suggestions"
      )
      if (!cli || !suggestion) return
      // do not disable the right arrow if we
      // are not at the head of the input buffer
      if (cli.selectionStart < cli.value.length) return
      // perform the suggestion autocomplete
      if (suggestion.placeholder) {
        cli.value = suggestion.placeholder
        suggestion.placeholder = ""
      }
    })
  }

  static oninput(e) {
    const suggestions = e.target.parentElement.querySelector(
      "#cli-suggestions"
    )
    if (!suggestions || !Session.current) return
    if (e.target.value == "")
      return (suggestions.placeholder = "")
    const [most_recent] = Session.current.history.match(
      e.target.value
    )
    suggestions.placeholder = most_recent || ""
  }

  view({ attrs }) {
    return [
      m("div.round-time", [
        // TODO: Is the some kind of global object to hook into to know the current roundtime?
        // Not sure what the programmatic options are here, I imagine we'll have to be doing our own math to figure out how best to handle this bars size.
        m("div.round-time-current", {
          style: "width: 50%;",
        }),
      ]),
      m(
        "span.prompt",
        Lens.get(
          Session.focused(),
          "state.prompt.text",
          ">"
        )
      ),
      m("#cnc", [
        m("input#cli", {
          autofocus: true,
          oninput: CLI.oninput.bind(attrs),
        }),
        m("input#cli-suggestions"),
      ]),
    ]
  }
}
