const Command = require("../command")
const { redraw } = require("../../util/redraw")
const Session = require("../../session")

exports.explain = Command.of(["state"], () => {
  Session.focused().state._modals.commands = !Session.focused()
    .state._modals.commands
  // Force redraw so it doesn't wait until next CLI redraw which may not happen right away.
  redraw(Session.focused())
})
