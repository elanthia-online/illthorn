const {Parser} = require("@elanthia/koschei")
const net      = require("net")
const State    = require("./state")
const Feed     = require("./feed")
const Bus      = require("../bus")
const History  = require("./command-history")
const {shell}  = require("electron")
 
module.exports = class Session {
  static Sessions = new Map()

  static has_focus (sess) {
    return sess.has_focus()
  }

  static has (id) {
    return Session.Sessions.has(id)
  }

  static set (id, sess) {
    return Session.Sessions.set(id, sess)
  }

  static get (id) {
    return Session.Sessions.get(id)
  }

  static delete (id) {
    return Session.Sessions.delete(id)
  }

  static list () {
    return Array.from(Session.Sessions)
      .map(([_, session])=> session)
  }

  static select (...args) {
    return Session.list()
      .filter(...args)
  }

  static find (...args) {
    return Session.list()
      .find(...args)
  }

  static fuzzy_find (name) {
    const case_matches = Session
      .select(sess => ~sess.name.indexOf(name))

    if (case_matches.length) return case_matches

    return Session
      .select(sess => ~sess.name.toLowerCase().indexOf(name.toLowerCase()))
  }

  static get_current_command () {
    const sess = Session.focused()
    if (!sess) return ""
    return sess.history.read()
  }

  static async of (opts) {
    const char = new Session(opts)
    await char.connect()
    char.rename(char.name || char.port)
    return char
  }

  static focused () {
    return Session.list()
      .filter(Session.has_focus)
      .pop()
  }

  static send_command (sess, command) {
    return sess.send_command(command)
  }

  constructor ({port, name}) {
    this.port    = port
    this.sock    = void 0
    this.history = History.of()
    this.name    = name || port
    this.parser  = Parser.of()
    this.feed    = Feed.of({session: this})
    this.state   = State.of(this)
  }

  _sock_listeners () {
    this.sock.on("close", _   => {
      if (!this.feed) return
      const pre = document.createElement("pre")
      pre.innerText = "\n*** Connection Closed ***\n"
      const frag = document.createDocumentFragment()
      frag.appendChild(pre)
      this.feed.append(frag)
    })
    this.sock.on("error", err => Bus
      .emit(err, {message: err.message, from: this.name}))
  }

  destroy () {
    Session.delete(this.name)
    this.sock.end()
    this.feed.destroy()
    this.feed = this.parser = this.state = void 0
    Bus.emit(Bus.events.REDRAW)
  }

  quit () {
    return this.sock.end()
  }

  has_focus () {
    return this.feed.has_focus()
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
    this.feed.reattach_head()
    return this
  }

  rename (name) {
    if (this.name && Session.has(this.name)) Session.delete(this.name)
    this.name = name
    Session.set(this.name, this)
    Bus.emit(Bus.events.REDRAW)
  }

  async connect () {
    return new Promise((resolve, reject)=> {
      this.sock = net.connect({port: this.port}, err => {
        if (err) return reject(err)

        this.sock.on("data", data => {
          if (data.toString().startsWith("<Launch")) {
            const src =  data.toString().match(/src="(.+)" \/>/)[1]
            return src && shell.openExternal("https://www.play.net" + src)
          }
          this.parser.parse(data)
        })
        resolve(this)
      })

      this._sock_listeners()
    })
  }

  send_command (cmd, id = "cli") {
    cmd = cmd.toString().trim()
    if (cmd.length == 0) return
    this.sock.write(cmd + "\n")
    this.parser.emit("tag", 
      { id
      , name : "prompt" 
      , text : this.state.get("prompt.text", ">") + cmd
      })

    return this
  }
}