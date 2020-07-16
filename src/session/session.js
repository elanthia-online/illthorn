const events = require("events")
const State = require("./state")
const Feed = require("./feed")
const Streams = require("./streams")
const Bus = require("../bus")
const History = require("./command-history")
const { shell } = require("electron")
const path = require("path")
const m = require("mithril")

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
    return Array.from(Session.Sessions)
      .map(([_, session]) => session)
      .sort((left, right) => left.port - right.port)
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
    await char.connect()
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
    this.feed = Feed.of({ session: this })
    this.streams = Streams.of({ session: this })
    this.state = State.of(this)
    this.worker = new Worker(
      path.resolve(__dirname, "worker.js")
    )
    this.worker.onerror = (err) =>
      Bus.emit(Bus.events.ERR, err)
    this.worker.onmessage = ({ data }) => {
      if (data.topic == "CLOSE") return this.close()
      if (data.topic == "OPEN") {
        // console.log(data)
        return shell.openExternal(data.link)
      }
      if (data.topic)
        return this.emit(data.topic, data.gram)
      console.warn(
        "Message(%o) was passed without a topic",
        data
      )
    }

    this.on("TAG", (tag) => {
      this.handle_tag(tag)
      m.redraw()
    })
  }

  handle_tag(tag) {
    //if (this.has_focus()) console.log("tag:%o", tag)
    // broadcast individual tags
    this.emit(tag.name, tag)
    // route streams
    if (
      tag.name == "stream" &&
      this.streams.wants(tag.id)
    ) {
      return this.streams.insert(tag)
    }
    // route main feed
    this.feed.add(tag)
  }

  get pending() {
    return !this.worker
  }

  close() {
    this.quit()
    if (!this.feed) return
    const pre = document.createElement("pre")
    pre.innerText = "\n*** Connection Closed ***\n"
    const frag = document.createDocumentFragment()
    frag.appendChild(pre)
    this.feed.append(frag)
  }

  destroy() {
    Session.delete(this.name)
    this.quit()
    this.feed.destroy()
    this.feed = this.worker = this.state = void 0
    Bus.emit(Bus.events.REDRAW)
  }

  quit() {
    this.worker && this.worker.terminate()
    this.worker = void 0
  }

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
    this.streams.redraw()
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

  async connect() {
    this.worker.postMessage({
      topic: "CONNECT",
      port: this.port,
    })
  }

  send_command(cmd, id = "cli") {
    cmd = cmd.toString().trim()
    if (cmd.length == 0) return

    const prompt = this.worker ? ">" : "closed>"

    this.emit("TAG", {
      id,
      name: "sent",
      text: this.state.get("prompt.text", prompt) + cmd,
    })

    this.worker &&
      this.worker.postMessage({
        topic: "COMMAND",
        command: cmd,
      })

    return this
  }
}
