import { SessionButton } from "../components/session/session-button"
import { addHilites } from "../hilites/dom"
import { castToHTML, createPrompt } from "../parser/dom"
import { Parser } from "../parser/parser"
import { Bus } from "../util/bus"
import { CommandHistory } from "./command-history"
import { dispatchMetadata } from "./helpers"
import { SessionMap } from "./map"
import { type SessionUI, makeSessionUI } from "./ui"

export class FrontendSession {
  static async connect (config : Illthorn.Session.Config) {
    const session = new FrontendSession(config)
    await window.Session.connect(config, (e, message) => session.onMessage(message))
    return session
  }

  readonly parser : Parser
  readonly ui     : SessionUI
  readonly bus    : Bus
  hasFocus : boolean = false
  readonly history : CommandHistory = new CommandHistory(100)
  readonly actionButton : SessionButton
  constructor (readonly config : Illthorn.Session.Config) {
    this.parser = Parser.of()
    this.bus    = new Bus()
    // this must be done last after all the other stuff
    this.ui     = makeSessionUI(this)
    this.actionButton = new SessionButton(this)
    this.streams(true)
    SessionMap.set(this.name, this)
  }

  get name () {
    return this.config.name
  }

  get port () {
    return this.config.port
  }

  streams (on: boolean) {
    this.ui.context.classList.toggle("streams-on", on)
    this.ui.streams.scrollToNow()
    this.ui.feed.scrollToNow()
  }

  async sendCommand (command : string) {
    await window.Session.sendCommand(this.config, command)
  }

  async onMessage (incoming : string) {
    const session = this
    const parsed = this.parser.parse(incoming)
    const {frag, metadata} = castToHTML(parsed)
    const promptInfo = metadata.find(tag => tag.name == "prompt")
    const prompt = promptInfo && createPrompt(promptInfo)

    // prompts are special, they are both metadata and rendered inline (sometimes)
    if (prompt) {session.bus.dispatchEvent("prompt", prompt) }
    await addHilites(frag)

    const streams = [...frag.querySelectorAll(".stream.thoughts")]

    if (streams.length) {
      streams.forEach(entry =>session.ui.streams.addEntry(entry))
    }

    if (frag.hasChildNodes() && frag.textContent?.trim() !== ""){
      session.ui.feed.appendParsed(frag)
    }

    if (!session.ui.feed.has_prompt() && prompt) {
      session.ui.feed.appendParsed(prompt)
    }
    if (metadata.length) metadata
      .forEach(tag => dispatchMetadata(session, tag))
  }

  handleMacro (macro : string) {
    const cliInput = this.ui.cli.input

    const replacement = macro.indexOf("?")

    if (!~replacement) {
      return macro
        .trim()
        .split(/\r|\n/g)
        .map((cmd) => cmd.trim())
        .filter((cmd) => cmd.length)
        .forEach((cmd) => this.sendCommand(cmd))
    }
    cliInput.value = macro
    cliInput.focus()
    cliInput.setSelectionRange(replacement - 1, replacement + "?".length)
  }

  async onFocus () {
    this.ui.streams.scrollToNow()
    this.ui.feed.scrollToNow()
  }
}