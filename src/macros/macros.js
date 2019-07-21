const KeyboardJS = require("keyboardjs")
const Settings   = require("../settings")
const Bus        = require("../bus")
const Session    = require("../session")

module.exports = class Macros {
  static Storage = Settings.of("macros")
  static DEFAULT = "default"

  static get (profile = Macros.DEFAULT) {
    return Macros.Storage.get(`profiles.${profile}`, 
      profile == Macros.DEFAULT ? {} : false)
  }

  static last_profile () {
    return Macros.Storage.get("active_profile", Macros.DEFAULT)
  }

  static set_context (profile = Macros.last_profile()) {
    const exists = Macros.get(profile)
    if (!exists) { throw new Error(`Macros(profile: ${profile}) does not exist`) }
    Macros.Storage.set("active_profile", profile)
    Macros.load(profile)
  }

  static bind_meta_macros () {

    KeyboardJS.on("up", e=> {
      const sess = Session.focused()
      const cli  = document.getElementById("cli")
      if (!sess || !cli) return
      sess.history.back()
      sess.history.write(cli)
    })

    KeyboardJS.on("down", e=> {
      const sess = Session.focused()
      const cli  = document.getElementById("cli")
      if (!sess || !cli) return
      sess.history.forward()
      sess.history.write(cli)
    })
   
    KeyboardJS.on("ctrl+pagedown", e => {
      const sess = Session.focused()
      sess && sess.feed.reattach_head()
    })
    // todo: handle scrolling from any focused state
    KeyboardJS.on("pageup", e => {
      const feed = document.querySelector(".feed")
      feed && feed.focus()
    })

    KeyboardJS.on("pagedown", e => {
      e.stopPropagation()
      const feed = document.querySelector(".feed")
      feed && feed.focus()
    })
  }

  static load (profile = Macros.DEFAULT) {
    KeyboardJS.reset()
    const macros = Macros.get(profile)
    Macros.bind_meta_macros()
    Object.entries(macros).forEach(([combo, macro])=> KeyboardJS
      .bind(combo.toLowerCase(), e => Bus
        .emit("macro", macro)))
  } 

  static async put (profile, combo, command) {
    combo = combo.toLowerCase()
    Macros.Storage.set(`profiles.${profile}.${combo}`, command)
  }

  static async delete (...path) {
    Macros.Storage.delete(`profiles.${path.join(".")}`)
  }
}