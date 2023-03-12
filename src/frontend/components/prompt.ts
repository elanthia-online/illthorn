export class Prompt extends HTMLElement {
  constructor () {
    super()
    /*
    session.bus.subscribeEvent<HTMLElement>("prompt", ({detail: prompt})=> {
      //console.trace(prompt)
      const _time = prompt.getAttribute("time")
      // todo: handle server time offset
      this.textContent = prompt.textContent
    })
    */

    this.textContent = "!>"
  }
}

window.customElements.define("illthorn-prompt", Prompt)
