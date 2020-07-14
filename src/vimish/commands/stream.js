const Command = require("../command")
const Bus = require("../../bus")
const Streams = require("../../session/streams")

exports.stream = exports.streams = Command.of(
  ["stream", "state"],
  async ({ stream, state }) => {
    stream = stream.toString().toLowerCase()
    if (state == "off") state = false
    if (state == "on") state = true
    if ("string" == typeof state)
      state = !!new Function(`return ${state}`).call()

    if (!Streams.ENUM[stream]) {
      throw new Error(
        `${stream} is not a valid stream, must be one of ${Object.keys(
          Streams.ENUM
        ).join(", ")}`
      )
    }

    Streams.Settings.set(`active.${stream}`, state)
    Bus.emit(Bus.events.REDRAW)
  }
)
