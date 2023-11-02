import { IllthornEvent } from "../../events"
import { currentSession} from "../../session/helpers"
import { type FrontendSession } from "../../session"
import { Illthorn } from "../../illthorn"

export class CLI extends HTMLElement {
  input   : HTMLInputElement
  constructor (readonly session : FrontendSession) {
    super()
    this.input   = document.createElement("input")
    this.input.autofocus = true
    this.append(this.input)

    this.input.addEventListener("keydown", e => {
      const history = this.session.history
      switch (e.key) {
        case "Enter":
          //e.preventDefault()
          return this.submitCommand()
        case "ArrowUp":
          if (history.position == 0) {
            history.add(this.input.value)
          }
          return this.setInput(history.back())
        case "ArrowDown":
          return this.setInput(history.forward())
      }

    })

    this.input.addEventListener("keyup", e => {
      switch (e.key) {
        default:
          return
      }
    })
  }

  setInput (value : string) {
    this.input.value = value
    setTimeout(()=> {
      this.input.setSelectionRange(value.length, value.length)
    }, 0)
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

    if (command[0] == ":") {
      return Illthorn.bus.dispatchEvent(IllthornEvent.SUBMIT_ILLTHORN_COMMAND, command)
    }
    if (command[0] == ";") {
      // This is going to Lich, so we'll not monkey with it
      return this.session.sendCommand(command)
    } 
    return command.split("\\r").forEach(c => {
        c = c.trim()
        this.session.sendCommand(c)
      })
  }
}

window.customElements.define("illthorn-cli", CLI)
