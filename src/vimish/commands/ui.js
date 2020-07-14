const Command = require("../command")
const Settings = require("../../settings")
const Bus = require("../../bus")

exports.ui = Command.of(
  ["component", "state"],
  async ({ component, state }) => {
    Settings.set(`ui.${component}`, state)
    Bus.emit(Bus.events.REDRAW)
  }
)
