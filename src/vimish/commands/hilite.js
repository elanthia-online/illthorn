const Command = require("../command")
const Hilites = require("../../hilites")

exports.hilite = exports.hilites = exports.hilight = Command.of(
  ["sub_command"],
  async (opts, rest, sudo) => {
    if (opts.sub_command == "add") {
      let [group, ...pattern] = rest
      pattern = pattern.join(" ")
      if (!pattern || pattern.length == 0) {
        throw new Error(
          ":hilite add <pattern> <group> was missing pattern"
        )
      }
      if (!group) {
        throw new Error(
          ":hilite add <pattern> <group> was missing group"
        )
      }
      return Hilites.add_pattern(group, pattern)
    }

    if (
      (opts.sub_command == "rm" ||
        opts.sub_command == "remove") &&
      sudo
    ) {
      throw new Error(":hilite remove not implemented yet")
      // todo: sudo ?
    }

    if (
      opts.sub_command == "rm" ||
      opts.sub_command == "remove"
    ) {
      throw new Error(":sudo is required for :hilite rm")
    }

    if (opts.sub_command == "reload") {
      return Hilites.reload()
    }

    if (opts.sub_command == "group") {
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
            (acc, [rule, value]) =>
              Object.assign(acc, { [rule]: value }),
            {}
          )
      )
    }

    throw new Error(
      `:hilite ${opts.sub_command} is not a valid subcommand`
    )
  }
)
