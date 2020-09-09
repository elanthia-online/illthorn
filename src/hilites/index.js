const Settings = require("../settings")

module.exports = class Hilites {
  static Patterns = Settings.of("hilites.patterns")
  static Groups = Settings.of("hilites.groups")
  static HEX_COLOR = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i
  static _CACHE = []

  static make_stylesheet() {
    const style = document.createElement("style")
    style.id = "hilites"
    style.appendChild(document.createTextNode(""))
    // Add the <style> element to the page
    document.head.appendChild(style)
    return style
  }

  static sheet() {
    return (
      document.getElementById("hilites") ||
      Hilites.make_stylesheet()
    ).sheet
  }

  static reset_sheet() {
    const sheet = Hilites.sheet()
    while (sheet.rules.length) sheet.removeRule(0)
  }

  static insert_group_rule(group, rules) {
    const sheet = Hilites.sheet()
    Object.entries(rules).forEach(([rule, value]) => {
      sheet.addRule(`.${group}`, `${rule}: ${value}`)
    })
  }

  static valid_hex_color(color) {
    return Hilites.HEX_COLOR.test(color)
  }

  static is_regex(hilite) {
    return (
      hilite[0] == "/" && hilite[hilite.length - 1] == "/"
    )
  }

  static reload() {
    Hilites.reset_sheet()

    Object.entries(Hilites.Groups.get(null, {})).forEach(
      ([group, rules]) => {
        Hilites.insert_group_rule(group, rules)
      }
    )

    return (Hilites._CACHE = Object.entries(
      Hilites.Patterns.get(null, {})
    ).map(([pattern, color]) => [
      Hilites.deserialize(pattern),
      color,
    ]))
  }

  static _CACHE = this.reload()

  static get() {
    return Hilites._CACHE
  }

  static deserialize(hilite) {
    if (Hilites.is_regex(hilite))
      return new RegExp(
        hilite.slice(1, hilite.length - 2),
        "g"
      )
    return new RegExp(hilite, "g")
  }

  static serialize(hilite) {
    return (Hilites.is_regex(hilite)
      ? new RegExp(hilite.slice(1, hilite.length - 2), "g")
      : new RegExp(hilite, "g")
    ).toString()
  }

  static add_pattern(group, pattern) {
    Hilites.Patterns.set(pattern, group)
    Hilites.reload()
  }

  static add_group(group, rules) {
    Hilites.Groups.set(group, rules)
    Hilites.reload()
  }
}
