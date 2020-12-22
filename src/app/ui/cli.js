const m = require("mithril")
const Session = require("../../session")
const Vimish = require("../../vimish")
const Lens = require("../../util/lens")
const Bus = require("../../bus")

const Logo = require("../img/illthorn-icon-large-transparent.png")

module.exports = class CLI {
  static CONTROL_CHAR = ":"

  static parse({ value }) {
    if (value[0] == CLI.CONTROL_CHAR) return CLI.fe_cmd(value)
    CLI.game_cmd(value)
  }

  static async fe_cmd(raw) {
    const [command, ...argv] = raw.slice(1).split(" ")
    const impl = Vimish.commands.get(command.toLowerCase())[command]
    try {
      if (!impl) {
        throw new Error(`:${command} is not a valid command`)
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
    const suggestion = document.getElementById("cli-suggestions")
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
    if (!Session.current) return

    if (!~replacement) {
      return macro
        .trim()
        .split(/\r|\n/g)
        .map((cmd) => cmd.trim())
        .filter((cmd) => cmd.length)
        .forEach((cmd) => Session.current.send_command(cmd, "macro"))
    }
    cli.value = macro
    cli.focus()
    cli.setSelectionRange(replacement - 1, replacement + "?".length)
  }

  /**
   * Handle any keypress relevant to the CLI.
   * @param {event} e keypress causing the event
   */
  static global_handlekeypress(e) {
    const cli = document.getElementById("cli")
    // Do not process the event if a macro key is active.
    if (!cli || CLI.is_macro(e)) return
    if (e.key == "Enter") return CLI.on_enter(cli, cli.value)
    cli.focus()
  }

  static autocomplete_right(_) {
    requestAnimationFrame(function () {
      const cli = document.getElementById("cli")
      const suggestion = document.getElementById("cli-suggestions")
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
    if (e.target.value == "") return (suggestions.placeholder = "")
    const [most_recent] = Session.current.history.match(e.target.value)
    suggestions.placeholder = most_recent || ""
  }

  static onclick(_) {
    Session.focused().state._modals.commands = !Session.focused().state
      ._modals.commands
  }

  view({ attrs }) {
    const sess = Session.focused()

    const roundTime = Lens.get(
      sess,
      "state._timers.roundtime.remaining",
      0
    )
    let roundTimeVisible = 0
    if (roundTime) {
      roundTimeVisible = 1
    }

    const castTime = Lens.get(sess, "state._timers.casttime.remaining", 0)
    let castTimeVisible = 0
    if (castTime) {
      castTimeVisible = 1
    }

    const commandsModalClass = Lens.get(
      Session.current,
      "state._modals.commands",
      false
    )
      ? "open"
      : ""

    // TODO: This does NOT seem ideal, but the idea is to force the timer bar `<div>` to re-kick-off the CSS animations when the `style` attribute changes. That can be done by forcing the browser to redraw (since Mithril itself doesn't redraw the whole element, it just updates the attributes).
    const forceRT = document.querySelector(".round-time-current")
    if (forceRT) {
      forceRT.classList.remove("go")
      void forceRT.offsetWidth
      forceRT.classList.add("go")
    }
    const forceCT = document.querySelector(".cast-time-current")
    if (forceCT) {
      forceCT.classList.remove("go")
      void forceRT.offsetWidth
      forceCT.classList.add("go")
    }

    return [
      m("div.timers", [
        m("div.timer-bar.round-time-current", {
          style: `--duration: ${roundTime}s; --steps: ${roundTime}; opacity: ${roundTimeVisible}`,
        }),
        m("div.timer-bar.cast-time-current", {
          style: `--duration: ${castTime}s; --steps: ${castTime}; opacity: ${castTimeVisible}`,
        }),
      ]),
      m(
        "span.prompt",
        Lens.get(Session.focused(), "state.prompt.innerText", ">")
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
          m("header", [
            m("img.logo", {
              src: Logo.default,
            }),
            m("h2", "Illthorn"),
            m("a.contribute", {
              href: "https://github.com/elanthia-online/illthorn",
              text: "Contribute on GitHub",
            }),
          ]),
          m("div.command-wrap", [
            m("code.command", ":ui vitals on|off"),
            m("span", "Show/Hide Vitals Panel"),
          ]),
          m("div.command-wrap", [
            m("code.command", ":ui injuries on|off"),
            m("span", "Show/Hide Injuries Panel"),
          ]),
          m("div.command-wrap", [
            m("code.command", ":ui active-spells on|off"),
            m("span", "Show/Hide Spells Panel"),
          ]),
          m("div.command-wrap.space-after", [
            m("code.command", ":ui compass on|off"),
            m("span", "Show/Hide Compass Panel"),
          ]),
          m("div.command-wrap", [
            m("code.command", ":stream death on|off"),
            m("span", "Show/Hide Death Stream"),
          ]),
          m("div.command-wrap.space-after", [
            m("code.command", ":stream thoughts on|off"),
            m("span", "Show/Hide Thoughts Stream"),
          ]),
          m("div.command-wrap.space-after", [
            m(
              "code.command",
              ":theme original|rogue|dark-king|icemule|kobold|raging-thrak"
            ),
            m("span", "Change Theme"),
          ]),
          m("div.command-wrap", [
            m("code.command", ":explain"),
            m("span", "Show/Hide This Modal"),
          ]),
        ]
      ),
    ]
  }
}
