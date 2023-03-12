import { IllthornEvent } from "../../events"
import { currentSession} from "../../session/helpers"
import { type FrontendSession } from "../../session"
import { Illthorn } from "../../illthorn"

export class CLI extends HTMLElement {
  history : string[]
  input   : HTMLInputElement
  constructor (readonly session : FrontendSession) {
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
    this.input.value = ""
    this.session.history.add(command)

    command[0] == ":"
      ? Illthorn.bus.dispatchEvent(IllthornEvent.SUBMIT_ILLTHORN_COMMAND, command)
      : this.session.sendCommand(command)
  }
}

window.customElements.define("illthorn-cli", CLI)
