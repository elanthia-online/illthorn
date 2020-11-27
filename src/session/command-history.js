const LimitedList = require("../util/limited-list")
const Storage = require("../storage")

/**
 * Safely wrap an index to a valid entry.
 * @param {number} idx Index to be wrapped
 * @param {number} length Length of array to wrap index for
 */
function wrap_index(idx, length) {
  // Compute offset for modulus to operate on a positive value
  let offset =
    idx >= 0 ? 0 : Math.floor(1 + Math.abs(idx) / length) * length
  return (idx + offset) % length
}

module.exports = class CommandHistory {
  static of() {
    return new CommandHistory()
  }
  /**
   * [recent] ----> [oldest]
   */
  constructor() {
    this.index = 0

    // Load commands from storage
    this.buffer = LimitedList.of(Storage.get("commandHistory"), {
      limit: 100,
    })
  }

  /**
   * Add a new command to the history.
   * @param {string} command to add to the history
   */
  add(command) {
    if (this.head().length == 0) {
      this.buffer.members[0] = command
    } else {
      this.buffer.lpush(command)
    }

    // Save commands into storage
    Storage.set(`commandHistory`, this.buffer.members)
  }

  /**
   * Returns the largest valid index available.
   */
  get last_index() {
    return Math.max(this.buffer.length - 1, 0)
  }

  /**
   * Step current index one step earlier in the history.
   */
  forward() {
    this.index = wrap_index(this.index - 1, this.length)
    //console.log("history:forward", this.index, this.read(), this.buffer.toJSON())
  }

  /**
   * Step current index one step deeper into the history.
   */
  back() {
    this.index = wrap_index(this.index + 1, this.length)
    //console.log("history:back", this.index, this.read(), this.buffer.toJSON())
  }

  /**
   * Read specified entry in the history.
   * @param {number} index of element to read
   */
  read(index = this.index) {
    return this.buffer.members[index] || ""
  }

  /**
   * Update the history at the current index.
   * @param {string} value New command to store at the current location.
   */
  update(value) {
    this.buffer.members[this.index] = value
  }

  /**
   * Compute the list of history entries matching the specified text.
   * @param {string} input Search string to compare against history.
   * @returns Filtered subset of the history that starts with the specified string, and is longer than the query phrase.
   */
  match(input) {
    return this.buffer.filter(
      (cmd) => cmd.startsWith(input) && cmd.length > input.length
    )
  }

  /**
   * Write current entry to specified element, and give it focus.
   * @param {Element} input HTML element to store history entry
   * @param {Object} obj Object with step flags.
   * @param {boolean} obj.forward Flag indicating if index should move forward
   * @param {boolean} obj.back Flag indicating if index should move back.
   */
  write(input, { forward, back }) {
    input.value = this.read()
    if (forward) this.forward()
    if (back) this.back()
    input.focus()
  }

  /**
   * Reads the most recent entry in the history.
   * @returns Most recent entry.
   */
  head() {
    return this.read(0)
  }

  /**
   * Sets the current index to the specified value.
   * @param {number} idx New index to set as current.
   * @returns This instance.
   */
  seek(idx) {
    // console.log("command:seek", idx)
    this.index = wrap_index(idx, this.length)
    return this
  }

  /**
   * Access length of the command history.
   */
  get length() {
    return this.buffer.length
  }
}
