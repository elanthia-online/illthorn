const m = require("mithril")
const Session = require("../../session")
const Vimish = require("../../vimish")
const Lens = require("../../util/lens")
const Bus = require("../../bus")

module.exports = class CLI {
  static CONTROL_CHAR = ":"

  static parse({ value }) {
    if (value[0] == CLI.CONTROL_CHAR)
      return CLI.fe_cmd(value)
    CLI.game_cmd(value)
  }

  static async fe_cmd(raw) {
    const [command, ...argv] = raw.slice(1).split(" ")
    const impl = Vimish.commands.get(command.toLowerCase())[
      command
    ]
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
      console.error(err)
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

  static onclick(e) {
    Session.focused().state._modals.commands = !Session.focused()
      .state._modals.commands
  }

  view({ attrs }) {
    const commandsModalClass = Lens.get(
      Session.current,
      "state._modals.commands",
      false
    )
      ? "open"
      : ""

    return [
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
          key: "cli.input",
        }),
        m("input#cli-suggestions", {
          key: "cli.suggestions",
        }),
      ]),
      m(
        "button.ui-help-button",
        {
          onclick: CLI.onclick,
        },
        "UI Commands Help"
      ),
      m(
        "div.modal",
        {
          class: commandsModalClass,
        },
        [
          m("h2", "Illthorn UI Commands"),
          m("ul.command-list", [
            m("li", [
              m("code.command", ":ui vitals on|off"),
              m("span", "Show/Hide Vitals Panel"),
            ]),
            m("li", [
              m("code.command", ":ui injuries on|off"),
              m("span", "Show/Hide Injuries Panel"),
            ]),
            m("li", [
              m("code.command", ":ui active-spells on|off"),
              m("span", "Show/Hide Active Spells Panel"),
            ]),
            m("li.space-after", [
              m("code.command", ":ui compass on|off"),
              m("span", "Show/Hide Compass Panel"),
            ]),
            m("li", [
              m("code.command", ":stream death on|off"),
              m("span", "Show/Hide Death Stream"),
            ]),
            m("li.space-after", [
              m("code.command", ":stream thoughts on|off"),
              m("span", "Show/Hide Thoughts/Chat Stream"),
            ]),
            m("li.space-after", [
              m(
                "code.command",
                ":theme original|dark-king"
              ),
              m("span", "Change Theme"),
            ]),
            m("li", [
              m("code.command", ":explain"),
              m("span", "Show/Hide This Modal"),
            ]),
          ]),
        ]
      ),
    ]
  }
}
