const Command = require("../command")
const { redraw } = require("../../util/redraw")
const Session = require("../../session")
const Settings = require("../../settings")

/**
 * focus on a session, will loosely match
 */
exports.focus = exports.f = Command.of(["name"], ({ name }) => {
  const candidates = Session.fuzzy_find(name)

  // ("Candidates(%o)", candidates)

  if (candidates.length > 1) {
    throw new Error(
      `Ambigious match for name(${name}) found ${candidates.length} matches`
    )
  }

  if (candidates.length == 0) {
    throw new Error(`No matches found for name(${name})`)
  }

  Settings.set("focus", candidates[0].name)

  redraw(candidates[0])
})
