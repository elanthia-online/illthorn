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
    return val
  }

  static delete (key) {
    return Storage.delete(key)
  }

  static get (key, fallback) {
    return Storage.get(key, fallback)
  }
  
  static set (key, val) {
    if (val.toLowerCase() == Settings.NIL) {
      return Settings.delete(key)
    }

    return Storage.set(key, 
      Settings.cast(val))
  }

  constructor (namespace) {
    this.namespace = Array.isArray(namespace) ? namespace : namespace.split(".")
    this._path = path => this.namespace.join(".") + "." + path
    this.get   = (path, fallback) => Settings.get(this._path(path), fallback)
    this.set   = (path, value)    => Settings.set(this._path(path), value)
  }
}