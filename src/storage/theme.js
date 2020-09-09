const THEME_NAMES = require("./theme-names")

exports.changeTheme = async function (data) {
  if (!THEME_NAMES[data.theme]) {
    return Promise.reject({ err: "invalid-theme" })
  }

  const styleTags = document.querySelectorAll(
    "style:not(#hilites)"
  )

  // You'd think you could do like
  // `../app/styles/themes/${data.theme}.scss`
  // But it fails??

  if (data.theme == "dark-king") {
    require(`../app/styles/themes/dark-king.scss`)
  } else if (data.theme == "original") {
    require(`../app/styles/themes/original.scss`)
  } else if (data.theme == "icemule") {
    require(`../app/styles/themes/icemule.scss`)
  } else if (data.theme == "kobold") {
    require(`../app/styles/themes/kobold.scss`)
  } else if (data.theme == "rogue") {
    require(`../app/styles/themes/rogue.scss`)
  } else if (data.theme == "raging-thrak") {
    require(`../app/styles/themes/raging-thrak.scss`)
  }

  styleTags.forEach((tag) => {
    if (!tag.innerText.includes("App styles")) {
      tag.setAttribute("media", "none")
    }
    if (tag.innerText.includes("THEME: " + data.theme)) {
      tag.setAttribute("media", "all")
    }
  })
}
