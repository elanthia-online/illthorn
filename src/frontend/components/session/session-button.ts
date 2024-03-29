import { focusSession} from "../../session/helpers"
import { type FrontendSession as Session } from "../../session"
import { Illthorn } from "../../illthorn"
import { IllthornEvent } from "../../events"

export class SessionButton extends HTMLElement {
  numeric : HTMLSpanElement
  tabNum : number
  constructor (readonly session : Session) {
    super()
    this.numeric = document.createElement("span")
    this.tabNum  = 0

    this.render()

    this.classList.add("action")

    Illthorn.bus.subscribeEvent<Session>(IllthornEvent.SESSION_FOCUS, ({detail: activeSession})=> {
      this.classList.toggle("on", this.session == activeSession)
    })

    this.addEventListener("click", e => {
      if (session.hasFocus) return
      focusSession(session)
    })
  }

  render () {
    const nameEle = document.createElement("span")
    nameEle.classList.add("session-name")
    nameEle.textContent = this.session.name[0]
    nameEle.title = this.session.name
    this.append(nameEle)
    this.numeric.classList.add("alt-numeric")
    this.append(this.numeric)
  }

  connectedCallback () {
    const siblings = this.parentElement?.children
    if (!siblings) return
    this.tabNum = Array.from(siblings).indexOf(this) + 1
    this.numeric.textContent = this.tabNum + ""
  }

}

window.customElements.define("illthorn-session-button", SessionButton)