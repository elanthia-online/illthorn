const CLI = require("./cli")
const parse_for_numpad = require("../../numpad/numpad")

module.exports = class Numpad {
  /**
   * Parse keypress events for numpad motion.
   * @param {event} e keypress to evaluate
   */
  static handlekeypress(e) {
    const command = parse_for_numpad(e)

    if (command === "") {
      return
    }
    e.preventDefault()
    return CLI.game_cmd(command)
  }
}
