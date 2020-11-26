const Command = require("../command")
const Settings = require("../../settings")

exports.compiler = Command.of(
  ["option", "value"],
  async ({ option, value }) => {
    if (option == "off") {
      option = "run"
      value = false
    }

    if (option == "on") {
      option = "run"
      value = true
    }

    Settings.set(`compiler.${option}`, value)
  }
)
