const Command = require("../command")
const Hilites = require("../../hilites")

/**
 * Add a pattern to the hilite database.
 * @param {Array<string>} rest Arguments to the command
 * @param {boolean} sudo Flag indicating if this was invoked with sudo
 */
function add_pattern(rest, _) {
  let [group, ...pattern] = rest
  pattern = pattern.join(" ")
  if (!pattern || pattern.length == 0) {
    throw new Error(":hilite add <pattern> <group> was missing pattern")
  }
  if (!group) {
    throw new Error(":hilite add <pattern> <group> was missing group")
  }
  return Hilites.add_pattern(group, pattern)
}

/**
 * Add a group to the database
 * @param {Array<string>} rest Arguments to the command
 * @param {boolean} sudo flag indicating if this was invoked with sudo
 */
function add_group(rest, _) {
  const [group, ...rules] = rest

  if (!rules.length) {
    throw new Error(
      `:hilite group <group> ...<rules> requires at least 1 rule`
    )
  }

  return Hilites.add_group(
    group,
    rules
      .map((rule) => rule.split("="))
      .reduce(
        (acc, [rule, value]) => Object.assign(acc, { [rule]: value }),
        {}
      )
  )
}

/**
 * Remove a group or pattern from the hilite database.
 * @param {Array<string>} rest Arguments to the command
 * @param {boolean} sudo Flag indicating if this was invoked with sudo
 */
function remove_command(rest, sudo) {
  if (!sudo) {
    throw new Error(":sudo is required for :hilite rm")
  }
  let [rmClass, ...pattern] = rest
  if (!pattern || pattern.length == 0) {
    throw new Error(
      `:sudo :hilite remove ${rmClass} requires an extra argument.`
    )
  }

  switch (rmClass) {
    case "group":
      if (
        Object.values(Hilites.Patterns).some((elem) => elem == pattern)
      ) {
        if (pattern[0] != "confirm") {
          throw new Error(
            `${pattern} is still in use. Please use :sudo :hilist remove group confirm <pattern> to force removal.`
          )
        }
        pattern = pattern.slice(1)
      }
      return Hilites.remove_group(pattern.join(" "))
    case "pattern":
      return Hilites.remove_pattern(pattern.join(" "))
    default:
      throw new Error(
        ":sudo :hilite remove <pattern|group> <text> missing pattern or group specifier."
      )
  }
}

exports.hilite = exports.hilites = exports.hilight = Command.of(
  ["sub_command"],
  async (opts, rest, sudo) => {
    switch (opts.sub_command) {
      case "add":
        return add_pattern(rest, sudo)
      case "remove":
      case "rm":
        return remove_command(rest, sudo)
      case "reload":
        return Hilites.reload()
      case "group":
        return add_group(rest, sudo)
      default:
        throw new Error(
          `:hilite ${opts.sub_command} is not a valid subcommand`
        )
    }
  }
)
