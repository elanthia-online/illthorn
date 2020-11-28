const Command = require("../command")
const Autodetect = require("../../autodetect")
const { redraw } = require("../../util/redraw")
const Session = require("../../session")

/**
 * connect to a session
 */
exports.connect = exports.c = Command.of(
  ["name", "port"],
  async (argv) => {
    // connect to all the sessions
    if (!argv.port && !argv.name) {
      return await Autodetect.connect_all()
    }

    // attempt to autodetect what port to connect to
    if (!argv.port) {
      const running = await Autodetect.list()

      const auto_detected = running.find(
        ({ name }) => ~name.indexOf(argv.name)
      )

      if (!auto_detected) {
        throw new Error(
          `could not find a session by the name ${argv.name}`
        )
      }

      Object.assign(argv, auto_detected)
    }

    if (Session.has(argv.name)) {
      throw new Error(`Session(name: ${argv.name}) already exists`)
    }

    if (
      Session.find(
        (sess) => sess.port.toString() == (argv.port || "").toString()
      )
    ) {
      throw new Error(`Session(port: ${argv.port}) already exists`)
    }

    const session = await Session.of(argv)
    redraw(session)
  }
)
