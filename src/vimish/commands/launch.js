const Command = require("../command")
const Launcher = require("../launcher")

exports["launch"] = Command.of(
  ["char", "port"],
  async ({ char, port }) => {
    return await Launcher.launch({ char, port })
  }
)
