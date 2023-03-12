import { type FrontendSession as Session } from "../../session/index"

export class Prompt extends HTMLElement {
  constructor (readonly session : Session) {
    super()
    session.bus.subscribeEvent<HTMLElement>("prompt", ({detail: prompt})=> {
      //console.trace(prompt)
      const _time = prompt.getAttribute("time")
      // todo: handle server time offset
      this.textContent = prompt.textContent
    })
  }
}

window.customElements.define("illthorn-prompt", Prompt)
