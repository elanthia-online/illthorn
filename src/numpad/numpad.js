const platform = require("../util/platform")
/**
 * Parse keypress events for numpad motion.
 * @param {event} e keypress to evaluate
 * @returns String representing mapped command, or an empty string.
 */
function parse_for_numpad(e) {
  // Keypress isn't from the numpad with NumLock disabled, nothing to do.
  if (
    e.location != KeyboardEvent.DOM_KEY_LOCATION_NUMPAD ||
    e.getModifierState("NumLock")
  ) {
    return ""
  }
  // Map of keypress codes to directions.
  const numpad_directions = {
    Numpad0: "up",
    Numpad1: "sw",
    Numpad2: "s",
    Numpad3: "se",
    Numpad4: "w",
    Numpad5: "out",
    Numpad6: "e",
    Numpad7: "nw",
    Numpad8: "n",
    Numpad9: "ne",
    NumpadDecimal: "down",
  }

  // Move directly if input is from the numpad and matches a direction.
  if (!(e.code in numpad_directions)) {
    return ""
  }
  // Support modifiers for sneaking or controlling a familiar.
  const is_sneak = platform.isMac() ? e.metaKey : e.altKey
  const is_familiar_command = e.ctrlKey
  let command = ""
  if (is_sneak) {
    command += "sneak "
  } else if (is_familiar_command) {
    command += "tell familiar to go "
  }
  command += numpad_directions[e.code]
  return command
}

module.exports = parse_for_numpad
