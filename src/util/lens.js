const make_path = 
  path => Array.isArray(path) ? path.slice(0) : path.split(".")

const is_nothing =
  t => (typeof t === "undefined" || t === null)

module.exports = class Lens {
  static of (path) {
    return new Lens(path)
  }

  static get (obj, path, fallback) {
    path = make_path(path)
    // walk the object
    while (path.length) {
      // bail early if the path is invalid
      if (is_nothing(obj)) return fallback
      obj = obj[path.shift()]
    }
    return is_nothing(obj) ? fallback : obj
  }

  static put (obj, path, val, root) {
    root = root || obj
    path = make_path(path)
    obj  = (typeof obj == "object" && obj) ? obj : {}

    if (path.length == 0) {
      return root
    }

    if (path.length == 1) {
      obj[path.shift()] = val
      return root
    }

    const next_key = path.shift()
    const next_obj = obj[next_key] = obj[next_key] || {}
    return Lens.put(next_obj, path, val, root)
  }

  constructor (path) {
    this.path = path
    this.get = (obj, fallback) => Lens.get(obj, this.path, fallback)
    this.put = (obj, val)      => Lens.put(obj, this.path, val)
  }
}