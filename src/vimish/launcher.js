const path = require("path")
const { format } = require("util")
const Session = require("../session")
const LauncherSettings = require("../settings").of("launcher")
const { spawn } = require("child_process")
const Bus = require("../bus")
// example: /cabal UP {...info}
const TCP_LISTENING_MSG = /^\/(\w+) UP/

exports.launch = async function ({ char, port }) {
  const bin = LauncherSettings.get("bin", false)

  if (typeof bin !== "string") {
    throw new Error(
      "config for launcher.bin must be set to an absolute path"
    )
  }

  if (path.isAbsolute(bin)) {
    spawn_launcher(bin, { char, port })
  }
}

function spawn_launcher(bin, { char, port }) {
  const with_char = bin.replace("{char}", char)

  const prepared_cmd =
    typeof port == "string" ? with_char.replace("{port}", port) : with_char

  const [absolute_bin, ...argv] = prepared_cmd.split(" ")

  const launcher = spawn(absolute_bin, argv, {
    detached: true,
    shell: true,
    cwd: process.cwd(),
    windowsHide: true,
  })

  launcher.stdout.on("data", (data) => {
    data = data.toString().trim()
    if (data.length == 0) return

    if (data.match(TCP_LISTENING_MSG)) {
      return listen(data)
    }

    Bus.emit(Bus.events.FLASH, {
      kind: "info",
      message: format("%s> %s", char, data),
    })
  })

  launcher.stderr.on("data", (data) => {
    data = data.toString().trim()
    if (data.length == 0) return
    Bus.emit(Bus.events.FLASH, {
      kind: "error",
      message: format("%s> %s", char, data),
    })
  })

  launcher.on("close", (code) => {
    Bus.emit(Bus.events.FLASH, {
      kind: "info",
      message: format(
        "%s> %s",
        char,
        `child process exited with code ${code}`
      ),
    })
  })
}

async function listen(msg) {
  const { character: name, port } = JSON.parse(
    msg.replace(TCP_LISTENING_MSG, "").trim()
  )
  Bus.emit(Bus.events.FLASH, {
    kind: "info",
    message: format("%s> listening on %s", name, port),
  })

  const sess = await Session.of({ name, port })
  // auto-focus
  if (!Session.current) {
    Bus.emit(Bus.events.FOCUS, sess)
  }
}
