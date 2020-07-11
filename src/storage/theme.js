const Bus = require("../bus")
const THEME_NAMES = require("./theme-names")
const Lens = require("../util/lens")
const Theme = require("../storage/theme")
const Session = require("../session")

exports.changeTheme = function (data) {
  const stylesheet = document.querySelector(
    "#theme-stylesheet"
  )
  if (data.theme === THEME_NAMES.original) {
    stylesheet.href = "./app/styles/themes/original.css"
  } else if (data.theme === THEME_NAMES["dark-king"]) {
    stylesheet.href = "./app/styles/themes/dark-king.css"
  }
}
