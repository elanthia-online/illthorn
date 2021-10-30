import { IllthornEvent } from "../../events"
import type { Session } from "../../session"
import { sendCommandToGame } from "../../session"

export class CLI extends HTMLElement {
  history : string[]
  input   : HTMLInputElement
  constructor (readonly session : Session) {
    super()
    this.history = []
    this.input   = document.createElement("input")
    this.append(this.input)

    this.input.addEventListener("keyup", e => {
      switch (e.key) {
        case "Enter":
          return this.broadcastCommand()
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

  broadcastCommand () {
    const value = this.input.value
    this.input.value = ""
    value[0] == ":"
      ? this.session.bus.dispatchEvent(IllthornEvent.SUBMIT_ILLTHORN_COMMAND, value)
      : sendCommandToGame(this.session, value)
  }
}

window.customElements.define("illthorn-cli", CLI)