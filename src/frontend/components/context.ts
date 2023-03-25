import { type FrontendSession } from "../session"

export class Context extends HTMLElement {
  constructor (readonly session : FrontendSession) {
    super()
  }
}


window.customElements.define("illthorn-context", Context)