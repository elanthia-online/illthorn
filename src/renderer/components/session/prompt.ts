import type { Session } from "../../session/index"

export class Prompt extends HTMLElement {
  constructor (readonly session : Session) {
    super()
    session.bus.subscribeEvent<HTMLElement>("metadata/prompt", ({detail: prompt})=> {
      const _time = prompt.getAttribute("time")
      // todo: handle server time offset
      this.textContent = prompt.textContent
    })
  }
}

window.customElements.define("illthorn-prompt", Prompt)