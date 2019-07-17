const Settings = require("../settings")

module.exports = class Hilites {
  static Storage   = Settings.of("hilites")
  static HEX_COLOR = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i

  static valid_hex_color (color) {
    return Hilites.HEX_COLOR.test(color)
  }

  static is_regex (hilite) {
    return (hilite[0] == "/" && hilite[hilite.length-1] == "/")
  }

  static get() {
    return Settings.get()
  }

  static deserialize (hilite) {
    if (!Hilites.is_regex(hilite)) return hilite

    try {
      return {ok: (new Function(`return ${hilite}`))()}
    } catch (err) {
      return {err: err.message, stack: err.stack}
    }
  }

  static set (pattern, color) {
    const {ok, err} = Hilites.deserialize(pattern)
    if (err) { throw new Error(err) }
    if (!Hilites.valid_hex_color(color)) {throw new Error(`Color(${color}) is not a valid hex code`)}
    Hilites.Storage.set(pattern, color)
  }
}