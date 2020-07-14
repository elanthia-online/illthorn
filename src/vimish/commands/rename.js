const Command = require("../command")
const Session = require("../../session")

/**
 * rename the current attached session
 */
exports.rename = exports.r = Command.of(
  ["name"],
  ({ name }) => {
    const session = Session.focused()
    session && session.rename(name)
  }
)
