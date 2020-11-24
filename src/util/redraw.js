const Bus = require("../bus")

/**
 * Send bus events to request a particular session redraw.
 * @param {Session} session Session to redraw
 */
function redraw(session) {
  Bus.emit(Bus.events.FOCUS, session)
  Bus.emit(Bus.events.REDRAW)
}

module.exports = { redraw }
