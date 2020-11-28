const Command = require("../command")
const Bus = require("../../bus")
const Session = require("../../session")

/**
 * swap two session names if you accidentally got them wrong
 */
exports.swap = Command.of(["other"], ({ other }) => {
  const focused = Session.focused()

  if (!focused) {
    throw new Error("Cannot swap names without an active session")
  }

  if (!Session.has(other)) {
    throw new Error(`No sessions named ${other} were found to swap with`)
  }

  const swap = Math.random().toString(13).replace("0.", "")
  const this_name = focused.name
  focused.rename(swap)
  Session.get(other).rename(this_name)
  focused.rename(other)
  Bus.emit(Bus.events.REDRAW)
})
