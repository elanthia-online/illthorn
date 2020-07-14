const Command = require("../command")
const Settings = require("../../settings")
const Bus = require("../../bus")

exports.set = Command.of(
  ["option", "value"],
  async ({ option, value }) => {
    Settings.set(option, value)
    Bus.emit(Bus.events.REDRAW)
  }
)
