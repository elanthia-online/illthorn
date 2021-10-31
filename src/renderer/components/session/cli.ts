import { IllthornEvent } from "../../events"
import type { Session } from "../../session"
import { sendCommandToGame } from "../../session"
import { Mode } from "../../session/command-history"

export class CLI extends HTMLElement {
  history : string[]
  input   : HTMLInputElement
  constructor (readonly session : Session) {
    super()
    this.history = []
    this.input   = document.createElement("input")
    this.append(this.input)

    this.input.addEventListener("keydown", e => {
      if (e.key == "Tab") return e.preventDefault()
    })

    this.input.addEventListener("keyup", e => {
      switch (e.key) {
        case "Enter":
          e.preventDefault()
          this.submitCommand()
          return false
        case "ArrowUp":
          e.preventDefault()
          session.history.write(this.input, Mode.BACKWARD)
          return false
        case "ArrowDown":
          e.preventDefault()
          session.history.write(this.input, Mode.FORWARD)
          return false
        case "Tab":
          e.preventDefault()
          return // todo
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
    this.session.history.add(command)
    this.input.value = ""
    command[0] == ":"
      ? this.session.bus.dispatchEvent(IllthornEvent.SUBMIT_ILLTHORN_COMMAND, command)
      : sendCommandToGame(this.session, command)
  }
}

window.customElements.define("illthorn-cli", CLI)