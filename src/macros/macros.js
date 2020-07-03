const KeyboardJS = require("keyboardjs")
const Settings = require("../settings")
const Bus = require("../bus")
const Session = require("../session")

module.exports = class Macros {
  static Storage = Settings.of("macros")
  static DEFAULT = "default"

  static get(profile = Macros.DEFAULT) {
    return Macros.Storage.get(
      `profiles.${profile}`,
      profile == Macros.DEFAULT ? {} : false
    )
  }

  static last_profile() {
    return Macros.Storage.get(
      "active_profile",
      Macros.DEFAULT
    )
  }

  static set_context(profile = Macros.last_profile()) {
    const exists = Macros.get(profile)
    if (!exists) {
      throw new Error(
        `Macros(profile: ${profile}) does not exist`
      )
    }
    Macros.Storage.set("active_profile", profile)
    Macros.load(profile)
  }

  static bind_meta_macros() {
    KeyboardJS.on("tab", (e) => {
      e.preventDefault()
      // todo: tab completion
      console.log(e)
    })

    KeyboardJS.on("right", (e) => {
      document.dispatchEvent(
        new Event("autocomplete/right")
      )
    })

    "1 2 3 4 5 6 7 8 9".split(" ").forEach((sess_idx) => {
      const idx = parseInt(sess_idx, 10) - 1
      KeyboardJS.on(`alt+${sess_idx}`, (e) => {
        const sess = Session.list()[idx]
        if (sess && sess !== Session.focused()) {
          Bus.emit(Bus.events.FOCUS, sess)
        }
      })
    })

    KeyboardJS.on("up", (e) => {
      e.preventDefault()
      const sess = Session.focused()
      const cli = document.getElementById("cli")
      if (!sess || !cli) return
      if (!sess.history.seeking)
        sess.history.write(cli, { back: 1 })
    })

    KeyboardJS.on("down", (e) => {
      e.preventDefault()
      const sess = Session.focused()
      const cli = document.getElementById("cli")
      if (!sess || !cli) return
      sess.history.write(cli, { forward: 1 })
    })

    KeyboardJS.on("ctrl+pagedown", (e) => {
      const sess = Session.focused()
      sess && sess.feed.reattach_head()
    })
    // todo: handle scrolling from any focused state
    KeyboardJS.on("pageup", (e) => {
      e.preventDefault()
      const sess = Session.focused()
      if (!sess) return
      const ele = sess.feed.root
      if (!ele) return
      ele.scrollBy(0, ele.clientHeight * -0.8)
      ele.dispatchEvent(new Event("mousewheel"))
    })

    KeyboardJS.on("pagedown", (e) => {
      e.preventDefault()
      const sess = Session.focused()
      if (!sess) return
      const ele = sess.feed.root
      if (!ele) return
      ele.scrollBy(0, ele.clientHeight * 0.8)
      ele.dispatchEvent(new Event("mousewheel"))
    })
  }

  static load(profile = Macros.DEFAULT) {
    KeyboardJS.reset()
    const macros = Macros.get(profile)
    Macros.bind_meta_macros()
    Object.entries(macros).forEach(([combo, macro]) =>
      KeyboardJS.bind(combo.toLowerCase(), (e) =>
        Bus.emit("macro", macro)
      )
    )
  }

  static async put(profile, combo, command) {
    combo = combo.toLowerCase()
    Macros.Storage.set(
      `profiles.${profile}.${combo}`,
      command
    )
  }

  static async delete(...path) {
    Macros.Storage.delete(`profiles.${path.join(".")}`)
  }
}
