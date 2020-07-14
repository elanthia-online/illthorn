const Command = require("../command")
const Lens = require("../../util/lens")
const Session = require("../../session")

exports.quit = exports.q = Command.of(
  ["name"],
  async ({ name }) => {
    if (!name) {
      name = Lens.get(Session.focused(), "name")
    }

    const candidates = Session.fuzzy_find(name)

    if (candidates.length > 1) {
      throw new Error(
        `Ambigious match for name(${name}) found ${candidates.length} matches`
      )
    }

    if (candidates.length == 0) {
      throw new Error(`No matches found for name(${name})`)
    }

    candidates[0].destroy()
  }
)
