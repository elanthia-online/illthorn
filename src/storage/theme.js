const THEME_NAMES = require("./theme-names")

exports.changeTheme = async function (data) {
  if (!THEME_NAMES[data.theme]) {
    return Promise.reject({ err: "invalid-theme" })
  }

  // TODO: Implement theme switching

  // return await exports.upsertCSS(
  //   "#theme-stylesheet",
  //   `./dist/themes/${data.theme}.css`
  // )
}

exports.upsertCSS = function (id, fileName) {
  return new Promise((ok) => {
    const previous_node = document.getElementById(id)
    const head = document.head
    const link = document.createElement("link")
    link.id = id
    link.type = "text/css"
    link.rel = "stylesheet"
    link.href = fileName
    link.onload = link.onerror = link.onabort = function () {
      // remove it after, so there is less blink!
      if (previous_node) previous_node.remove()
      ok()
    }
    head.appendChild(link)
  })
}
