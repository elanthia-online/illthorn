const Command = require("../command")
const Commands = require("../index")

/**
 * for sudo actions
 */
exports.sudo = Command.of(["command"], async (opts, argv) => {
  const command = opts.command.startsWith(":")
    ? opts.command.slice(1).toLowerCase()
    : opts.command.toLowerCase()
  const cmd = Commands.commands[command]
  if (cmd) return cmd.run(argv, true)
  throw new Error(`:${command} not found`)
})
