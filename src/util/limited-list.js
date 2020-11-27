/**
 * List with a maximum number of entries.
 */
class LimitedList {
  static of(members = [], opts = {}) {
    return new LimitedList(members, opts)
  }

  /**
   * Constructor to create a new instance.
   * @param {Array} members Initial array of entries.
   * @param {object} opts Options to configure list.
   * @param {number} opts.limit Max number of entries to support.
   */
  constructor(members = [], opts = {}) {
    this.members = members
    this.limit = opts.limit || 100
  }

  /**
   * Access number of elements currently in list.
   */
  get size() {
    return this.members.length
  }

  /**
   * Access number of elements currently in list.
   */
  get length() {
    return this.size
  }

  /**
   * Produce JSON equivalent of this object.
   */
  toJSON() {
    return this.members
  }

  /**
   * Return a filtered version of the array.
   * @param  {...any} args Arguments to pass to filter.
   * @returns Filtered version of the list.
   */
  filter(...args) {
    return this.members.filter.apply(this.members, args)
  }

  /**
   * Add a set of items to the list.
   * @param  {...any} items Items to add to the list
   * @returns Return a reference to this list.
   */
  lpush(...items) {
    this.members.unshift(...items)
    while (this.size > this.limit) this.rpop()
    return this
  }

  /**
   * Access first element in the list.
   */
  head() {
    return this.members[0]
  }

  /**
   * Pop the final element from the list, and return it.
   * @returns Last element in the array.
   */
  rpop() {
    return this.members.pop()
  }
}

module.exports = LimitedList
