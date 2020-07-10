const path = require("path")
const { remote } = require("electron")
const Bus = require("../bus")

const config_dir = remote.app.getPath("userData")
const customCSS = path.join(config_dir, "user.css")

const THEME_ORIGINAL = "original"
const THEME_DARK_KING = "dark-king"

exports.customCSS = customCSS

exports.injectCSS = function (fileName = customCSS) {
  return new Promise((ok) => {
    const previous_node = document.querySelector(
      "link.user-styles"
    )
    const head = document.head
    const link = document.createElement("link")
    link.classList.add("user-styles")
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

Bus.on(Bus.events.CHANGE_THEME, (data) => {
  const stylesheet = document.querySelector(
    "#theme-stylesheet"
  )
  if (data.theme === THEME_ORIGINAL) {
    stylesheet.href = "./app/styles/themes/original.css"
  } else if (data.theme === THEME_DARK_KING) {
    stylesheet.href = "./app/styles/themes/dark-king.css"
  }
})
