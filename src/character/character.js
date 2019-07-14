const {Parser} = require("@elanthia/koschei")
const net      = require("net")
const State    = require("./character-state")
const Feed     = require("./feed")
const Bus      = require("../bus")

const last = 
  list => list.pop()

module.exports = class Character {
  static Connected = new Map()

  static is_active (character) {
    return character.is_active()
  }

  static loose_select (name) {
    return Array.from(Character.Connected)
      .filter(([active, _])=> ~active.indexOf(name))
  }

  static async of (opts) {
    const char = new Character(opts)
    await char.connect()
    char.rename(char.name || char.port)
    return char
  }

  static get_active () {
    return last(Array.from(Character.Connected).map(last)
      .filter(Character.is_active))
  }

  static send_command (character, command) {
    return character.send_command(command)
  }

  constructor ({port, name}) {
    this.port    = port
    this.sock    = void 0
    this.name    = name || port
    this.parser  = Parser.of()
    this.feed    = Feed.of({character: this})
    this.state   = State.of(this)
  }

  _sock_listeners () {
    this.sock.on("close", _   => this.destroy())
    this.sock.on("error", err => Bus.emit(err, {message: err.message, from: this.name}))
  }

  destroy () {
    Character.Connected.delete(this.name)
    this.feed.destroy()
    this.feed = this.parser = this.state = void 0
    Bus.emit(Bus.events.REDRAW)
  }

  quit () {
    return this.sock.end()
  }

  is_active () {
    return this.feed.is_active()
  }

  activate () {
    this.feed.activate()
    return this
  }

  idle () {
    this.feed.idle()
    return this
  }

  attach (view) {
    this.activate()
    this.feed.attach_to_dom(view)
    this.feed.scroll_to_bottom()
    return this
  }

  rename (name) {
    if (this.name && Character.Connected.has(this.name)) Character.Connected.delete(this.name)
    this.name = name
    Character.Connected.set(this.name, this)
    Bus.emit(Bus.events.REDRAW)
  }

  async connect () {
    return new Promise((resolve, reject)=> {
      this.sock = net.connect({port: this.port}, err => {
        if (err) return reject(err)
        this.sock.pipe(this.parser)
        resolve(this)
      })

      this._sock_listeners()
    })
  }

  send_command (cmd) {
    this.sock.write(cmd.toString() + "\n")
    this.parser.emit("tag", 
      { name : "prompt"
      , id   : "cli"
      , text : this.state.get("prompt.text", ">") + cmd
      })

    return this
  }
}