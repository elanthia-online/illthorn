const THEME_NAMES = require("./theme-names")

exports.changeTheme = function (data) {
  const stylesheet = document.querySelector(
    "#theme-stylesheet"
  )

  if (data.theme in THEME_NAMES) {
    stylesheet.href = `./dist/themes/${data.theme}.css`
  }
}
