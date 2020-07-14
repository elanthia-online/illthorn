const Command = require("../command")
const Settings = require("../../settings")
const Bus = require("../../bus")

const THEME_NAMES = require("../../storage/theme-names")

// `:theme dark-king`
exports.theme = Command.of(["value"], async ({ value }) => {
  if (!(value in THEME_NAMES)) {
    throw new Error(`Not a valid theme`)
  }
  Settings.set("theme", value)
  Bus.emit(Bus.events.CHANGE_THEME, {
    theme: value,
  })
})
