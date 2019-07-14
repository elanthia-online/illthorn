const Character = require("../character")
const ps_list   = require("ps-list")
const Bus       = require("../bus")

// ruby /home/benjamin/gemstone/lich/lich.rb --login Ondreian --detachable-client=8003 --without-frontend
const is_lich_proc = 
  ({name, cmd})=> name == "ruby" && cmd.includes("lich.rb") && cmd.includes("--without-frontend")

const not_zero_port =
  ({port})=> port > 0

const parse_lich_cmd =
  cmd => ({ name: cmd.match(/--login\s(\w+)\s/)[1]
          , port: cmd.match(/--detachable-client=(\d+)\s/)[1]
          })

module.exports = class Autodetect {
  static async list () {
    return (await ps_list()).filter(is_lich_proc)
      .map(({cmd})=> cmd)
      .map(parse_lich_cmd)
      .filter(not_zero_port)
  }

  static async connect_all () {
    const connections = (await Autodetect.list()).map(opts => {
      try {
        Character.of(opts)
      } catch (err) {
        Bus.emit("error", {message: err.message, from: opts.name})
      }
    })

    await Promise.all(connections)
    Bus.emit(Bus.events.REDRAW)
  }
}
