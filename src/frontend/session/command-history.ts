//import { LimitedList } from "../util/limited-list"

export enum Mode
  { FORWARD
  , BACKWARD
  }

/**
 * Safely wrap an index to a valid entry.
 */
function wrap_index(idx : number, length : number) {
  // Compute offset for modulus to operate on a positive value
  const offset =
    idx >= 0 ? 0 : Math.floor(1 + Math.abs(idx) / length) * length
  return (idx + offset) % length
}

export class CommandHistory extends Array<string> {

  /**
   * [recent] ----> [oldest]
   */
  position  : number;

  constructor (readonly maxSize = 500) {
    super()
    this.position = 0
  }
  /**
   * Add a new command to the history.
   */
  add(command : string) {
    if (this.head().length == 0) {
      this[0] = command
    } else {
      this.unshift(command)
    }
    this.resetPosition()
    // Save commands into storage
    // Storage.set(`commandHistory`, this)
  }

  resetPosition () {
    this.position = 0
  }
  /**
   * Returns the largest valid index available.
   */
  get last_index() {
    return Math.max(this.length - 1, 0)
  }
  /**
   * Step current index one step earlier in the history.
   */
  forward() {
    this.position = wrap_index(this.position - 1, this.length)
    //console.log("history:forward", this.index, this.read(), this.toJSON())
    return this[this.position]
  }
  /**
   * Step current index one step deeper into the history.
   */
  back() {
    this.position = wrap_index(this.position + 1, this.length)
    return this[this.position]
    //console.log("history:back", this.index, this.read(), this.toJSON())
  }
  /**
   * Read specified entry in the history.
   */
  read(index = this.position) {
    return this[index] || ""
  }
  /**
   * Update the history at the current index.
   */
  update(value : string) {
    this[this.position] = value
  }
  /**
   * Compute the list of history entries matching the specified text.
   */
  match(input : string) {
    return this.filter(
      (cmd : string) => cmd.startsWith(input) && cmd.length > input.length
    )
  }
  /**
   * Write current entry to specified element, and give it focus.
   */
  write(input : HTMLInputElement, mode : Mode) {
    input.value = this.read()
    switch (mode) {
      case Mode.FORWARD:  return this.forward()
      case Mode.BACKWARD: return this.back()
    }
    //input.focus()
  }
  /**
   * Reads the most recent entry in the history.
   */
  head() {
    return this.read(0)
  }
  /**
   * Sets the current index to the specified value.
   */
  seek(idx : number) {
    // console.log("command:seek", idx)
    this.position = wrap_index(idx, this.length)
    return this
  }
}
