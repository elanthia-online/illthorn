const Bus = require("../bus")
const THEME_NAMES = require("./theme-names")
const Lens = require("../util/lens")
const Theme = require("../storage/theme")
const Session = require("../session")

exports.changeTheme = function (data) {
  const stylesheet = document.querySelector(
    "#theme-stylesheet"
  )

  if (data.theme in THEME_NAMES) {
    stylesheet.href = `./app/styles/themes/${data.theme}.css`
  }
}
