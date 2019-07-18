const Storage = require("../storage")

module.exports = class Settings {
  static NIL = "nil"

  static of (namespace) {
    return new Settings(namespace)
  }

  static cast (val) {
    if (val === "on")  return true
    if (val === "off") return false
    if (val === "1")   return true
    if (val === "0")   return false
    if (typeof val == "boolean") return val
    if (!isNaN(val))   return parseInt(val)
    return val
  }

  static delete (key) {
    return Storage.delete(key)
  }

  static get (key, fallback) {
    return Storage.get(key, fallback)
  }
  
  static set (key, val) {
    if (val.toString().toLowerCase() == Settings.NIL) {
      return Settings.delete(key)
    }

    val = Settings.cast(val)

    console.log("Settings(key: %s, value: %o)", key, val)

    return Storage.set(key, val)
  }

  constructor (namespace) {
    this.namespace = Array.isArray(namespace) ? namespace : namespace.split(".")
    this._path = path => this.namespace.join(".") + (typeof path == "string" ? "." + path : "")
    this.get   = (path, fallback) => Settings.get(this._path(path), fallback)
    this.set   = (path, value)    => Settings.set(this._path(path), value)
    this.delete = path => Settings.delete(this._path(path))
  }
}