const Command = require("../command")

const quitSession = require("../functions/quitSession.js")

exports.quit = Command.of(["name"], async ({ name }) => {
  quitSession(name)
})
