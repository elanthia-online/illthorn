const path = require("path")
const LauncherSettings = require("../settings").of(
  "launcher"
)
const { spawn } = require("child_process")

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
    typeof port == "string"
      ? with_char.replace("{port}", port)
      : with_char

  const [absolute_bin, ...argv] = prepared_cmd.split(" ")

  const launcher = spawn(absolute_bin, argv, {
    detached: true,
  })

  launcher.stdout.on("data", (data) => {
    // todo : flash
    console.log(`(%s):stdout: ${data}`, prepared_cmd)
  })

  launcher.stderr.on("data", (data) => {
    // todo : flash
    console.error(`(%s):stderr: ${data}`, prepared_cmd)
  })

  launcher.on("close", (code) => {
    // todo : flash
    console.log(
      `(%s):child process exited with code ${code}`,
      prepared_cmd
    )
  })
}
