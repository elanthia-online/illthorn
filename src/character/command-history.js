const LimitedList = require("../util/limited-list")

module.exports = class CommandHistory {
  static of () {
    return new CommandHistory()
  }

  constructor () {
    this.index  = 0
    this.buffer = LimitedList.of([], 
      { limit: 100 
      })
  }

  add (command) {
    this.buffer.lpush(command)
  }

  get last_index () {
    return this.buffer.length - 1
  }

  left () {
    --this.index
    if (this.index < 0) this.index = this.last_index
  }

  right () {
    ++this.index
    if (this.index > this.last_index) this.index = 0
  }

  read () {
    return this.buffer[this.index] || ""
  }

  update (value) {
    this.buffer[this.index] = value
  }

  write (input) {
    input.value = this.read()
    input.focus()
    input.setSelectionRange(input.value.length)
  }

  seek (idx) {
    this.index = idx
    if (this.index < 0) this.index = this.last_index
    if (this.index > this.last_index) this.index = 0
    return this
  }
}