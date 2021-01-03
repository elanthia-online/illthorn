const Command = require("../command")
const connectSession = require("../functions/connectSession.js")

exports.connect = exports.c = Command.of(["name", "port"], (argv) => {
  connectSession(argv)
})
