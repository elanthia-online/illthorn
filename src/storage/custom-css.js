const path = require("path")
const { remote } = require("electron")

const config_dir = remote.app.getPath("userData")
const customCSS = path.join(config_dir, "user.css")

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
