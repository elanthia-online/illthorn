const events = require("events")
const net = require("net")
const Parser = require("../parser")
const State = require("./state")
const Feed = require("./feed")
const Streams = require("./streams")
const Bus = require("../bus")
const History = require("./command-history")
const IO = require("../util/io")
const SessionState = require("./state")

module.exports = class Session extends events.EventEmitter {
  static Sessions = new Map()

  static has_focus(sess) {
    return sess.has_focus()
  }

  static has(id) {
    return Session.Sessions.has(id)
  }

  static set(id, sess) {
    return Session.Sessions.set(id, sess)
  }

  static get(id) {
    return Session.Sessions.get(id)
  }

  static delete(id) {
    return Session.Sessions.delete(id)
  }

  static list() {
    const list = Array.from(Session.Sessions)
      .map(([_, session]) => session)
      .sort((left, right) => left.port - right.port)
    return list
  }

  static select(...args) {
    return Session.list().filter(...args)
  }

  static find(...args) {
    return Session.list().find(...args)
  }

  static fuzzy_find(name) {
    const case_matches = Session.select(
      (sess) => sess.name && ~sess.name.indexOf(name)
    )

    if (case_matches.length) return case_matches

    return Session.select(
      (sess) =>
        sess.name &&
        ~sess.name.toLowerCase().indexOf(name.toLowerCase())
    )
  }

  static get_current_command() {
    const sess = Session.focused()
    if (!sess) return ""
    return sess.history.read()
  }

  static async of(opts) {
    const char = new Session(opts)
    char.rename(char.name || char.port)
    return char
  }

  static focused() {
    return Session.list().filter(Session.has_focus).pop()
  }

  static get current() {
    return Session.focused()
  }

  static send_command(sess, command) {
    return sess.send_command(command)
  }

  constructor({ port, name }) {
    super()
    this.port = port
    this.sock = void 0
    this.history = History.of()
    this.name = name || port
    this.log = require("debug")(
      "illthorn:session:" + this.name
    )
    this.feed = Feed.of({ session: this })
    this.streams = Streams.of({ session: this })
    this.state = State.of(this)
    this.sock = net.connect({ port })
    this.sock.on("data", (data) => this.parse(data))
    this.sock.on("error", (err) => this.emit("error", err))
    this.sock.on("close", (_) => this.close())
    // buffer for incoming game lines
    this.buffer = ""
    this.io = IO(this.buffer)
  }

  async parse(string) {
    const t0 = performance.now()
    await this.io.fmap(async () => {
      const { parsed } = await Parser.parse(this, string)
      if (parsed) {
        this.feed.ingest(parsed.text, parsed.prompt)
        ~[...parsed.metadata.childNodes].forEach(
          (update) => {
            SessionState.consume(this.state, update)
          }
        )
      }
    })
    const t1 = performance.now()
    this.log(
      `parsed ${string.length} characters in ${Math.round(
        (t1 - t0) * 1000
      )}μs`
    )
  }

  close() {
    this.quit()
    if (!this.feed) return
    const pre = document.createElement("pre")
    pre.classList.add("session-closed")
    pre.innerText = `\n*** ${this.name} / Connection Closed ***`
    const frag = document.createDocumentFragment()
    frag.appendChild(pre)
    this.feed.append(frag)
    Session.Sessions.delete(this.name)
    Bus.emit(Bus.events.REDRAW)
  }

  destroy() {
    Session.delete(this.name)
    this.quit()
    this.feed.destroy()
    this.feed = this.state = void 0
    Bus.emit(Bus.events.REDRAW)
  }

  quit() {}

  has_focus() {
    return this.feed.has_focus()
  }

  activate() {
    this.feed.activate()
    return this
  }

  idle() {
    this.feed.idle()
    return this
  }

  attach(view) {
    this.activate()
    this.feed.attach_to_dom(view)
    this.streams.redraw(view)
    this.feed.reattach_head()
    return this
  }

  rename(name) {
    if (this.name && Session.has(this.name))
      Session.delete(this.name)
    this.name = name
    Session.set(this.name, this)
    Bus.emit(Bus.events.REDRAW)
  }

  send_command(cmd, id = "cli") {
    cmd = cmd.toString().trim()
    if (cmd.length == 0) return
    const prompt = this.feed.has_prompt()
      ? this.feed.root.lastElementChild
      : document.createElement("prompt")
    prompt.className = ""
    prompt.classList.add(id, "sent")
    prompt.innerText =
      this.state.get("prompt.innerText", ">") + cmd
    if (!prompt.parentNode) {
      this.feed.append(prompt)
    }

    this.sock.write(`${cmd}\r\n`)
    return this
  }
}
