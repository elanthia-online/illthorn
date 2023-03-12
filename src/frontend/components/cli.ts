import { IllthornEvent } from "../events"
import { currentSession, sendCommandToGame } from "../session/helpers"
import { Illthorn } from "../illthorn"

export class CLI extends HTMLElement {
  history : string[]
  input   : HTMLInputElement
  constructor () {
    super()
    this.history = []
    this.input   = document.createElement("input")
    this.input.autofocus = true
    this.append(this.input)

    this.input.addEventListener("keydown", e => {
      switch (e.key) {
        case "Enter":
          currentSession()?.history.resetPosition()
          e.preventDefault()
          this.submitCommand()
      }

    })

    this.input.addEventListener("keyup", e => {
      switch (e.key) {
        default:
          return
      }
    })
  }

  connectedCallback () {
    this.input.focus()
  }

  position () {
    const position = this.getAttribute("position")
    if (!position) return 0
    return parseInt(position, 10)
  }

  submitCommand () {
    const command = this.input.value
    const sess = currentSession()
    this.input.value = ""
    
    if (sess) sess.history.add(command)

    command[0] == ":"
      ? Illthorn.bus.dispatchEvent(IllthornEvent.SUBMIT_ILLTHORN_COMMAND, command)
      : sess && sendCommandToGame(sess, command)
  }

  handleMacro (macro : string) {
    const session = currentSession()
    if (!session) return
      
    const cliInput = this.input

    const replacement = macro.indexOf("?")

    if (!~replacement) {
      return macro
        .trim()
        .split(/\r|\n/g)
        .map((cmd) => cmd.trim())
        .filter((cmd) => cmd.length)
        .forEach((cmd) => session.sendCommand(cmd))
    }
    cliInput.value = macro
    cliInput.focus()
    cliInput.setSelectionRange(replacement - 1, replacement + "?".length)
  }
}

window.customElements.define("illthorn-cli", CLI)
