module.exports = class LimitedList {
  static of(members  = [], opts) {
    return new LimitedList(members, opts)
  }
  constructor (members, opts) {
    this.members = members
    this.limit   = opts.limit
  }
  get size () {
    return this.members.length
  }
  get length () {
    return this.size
  }
  
  lpush (...items) {
    this.members.unshift(...items)
    while (this.size > this.limit) this.lpop()
    return this
  }

  head () {
    this.members[0]
  }

  rpop () {
    return this.members.pop()
  }
}