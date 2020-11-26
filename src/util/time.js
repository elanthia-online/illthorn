module.exports = class Time {
  /**
   * Format a duration in seconds to a human readable shorthand.
   * @param {number} Number of seconds
   * @returns Number of seconds represented as a string.
   */
  static format(seconds) {
    let isNegative = seconds < 0
    seconds = Math.abs(seconds)
    let days, hours, minutes
    days = Math.floor(seconds / 86400)
    seconds -= days * 86400
    hours = Math.floor(seconds / 3600)
    seconds -= hours * 3600
    minutes = Math.floor(seconds / 60)
    seconds -= minutes * 60
    let str = isNegative ? "-" : ""
    // only show days if it makes sense
    if (days) str += days + "d "
    if (hours) str += hours + "h "
    // show all other columns
    return (
      str +
      minutes.toString().padStart(2, "0") +
      "m " +
      seconds.toString().padStart(2, "0") +
      "s"
    )
  }
}
