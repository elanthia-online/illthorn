const CLI = require("./cli")

module.exports = class Numpad {
  /**
   * Parse keypress events for numpad motion.
   * @param {event} e keypress to evaluate
   */
  static handlekeypress(e) {
    // Allow numpad to control movement.
    const numpad_location = 3
    // Map of keypress codes to directions.
    const numpad_directions = {
      Numpad1: "sw",
      Numpad2: "s",
      Numpad3: "se",
      Numpad4: "w",
      Numpad5: "out",
      Numpad6: "e",
      Numpad7: "nw",
      Numpad8: "n",
      Numpad9: "ne",
      Numpad0: "up",
      NumpadDecimal: "down",
    }

    // Move directly if input is from the numpad and matches a direction.
    if (e.location == numpad_location && e.code in numpad_directions) {
      e.preventDefault()
      return CLI.game_cmd(numpad_directions[e.code])
    }
  }
}
