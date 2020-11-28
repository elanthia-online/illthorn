const Command = require("../command")
const Commands = require("../index")

/**
 * for sudo actions
 */
exports.sudo = Command.of(["command"], async (opts, argv) => {
  const command = opts.command.startsWith(":")
    ? opts.command.slice(1)
    : opts.command
  const cmd = Commands.commands.get(command)[command]
  if (cmd) return cmd.run(argv, true)
  throw new Error(`:${command} not found`)
})
