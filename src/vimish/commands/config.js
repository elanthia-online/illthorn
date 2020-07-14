const Command = require("../command")
const Storage = require("../../storage")

exports.config = Command.of([], async () => {
  Storage.openInEditor()
})
