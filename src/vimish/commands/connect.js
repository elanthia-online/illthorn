const Command = require("../command")
const Bus = require("../../bus")
const Autodetect = require("../../autodetect")
const Session = require("../../session")

const redraw = (session) => {
  Bus.emit(Bus.events.FOCUS, session)
  Bus.emit(Bus.events.REDRAW)
}

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

    // console.log(argv)
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
      throw new Error(
        `Session(name: ${argv.name}) already exists`
      )
    }

    if (
      Session.find(
        (sess) =>
          sess.port.toString() ==
          (argv.port || "").toString()
      )
    ) {
      throw new Error(
        `Session(port: ${argv.port}) already exists`
      )
    }

    const session = await Session.of(argv)
    redraw(session)
  }
)
