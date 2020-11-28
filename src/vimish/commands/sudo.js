const Command = require("../command")

/**
 * for sudo actions
 */
exports.sudo = Command.of(["command"], async (opts, argv) => {
  const command =
    opts.command[0] == ":" ? opts.command.slice(1) : opts.command
  const cmd = exports[command]
  if (cmd) return cmd.run(argv, true)
  throw new Error(`:${opts.command} not found`)
})
