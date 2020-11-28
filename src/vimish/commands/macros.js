const Command = require("../command")
const Macros = require("../../macros")

exports.macros = exports.macro = Command.of(
  ["sub_command", "profile"],
  async function ({ sub_command, profile }, args) {
    if (sub_command == "use") {
      return Macros.set_context(profile)
    }

    const [combo, ...macro] = args

    if (!macro)
      throw new Error(
        ":macros <sub_command> <profile> ...rest was missing a <profile>"
      )

    if (sub_command == "add" || sub_command == "set") {
      return Macros.put(profile, combo, macro.join(" "))
    }

    if (sub_command == "rm") {
      return Macros.delete(profile, combo)
    }

    throw new Error(`:macros ${sub_command} is not a valid subcommand`)
  }
)
