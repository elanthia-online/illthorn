import type { GameTag } from "../../parser/tag"
import { type FrontendSession as Session } from "../../session/index"


export class Hand extends HTMLElement {
  constructor (readonly session : Session, readonly name: string) {
    super()
    this.classList.add(name)
    this.session.bus.subscribeEvent<GameTag>("metadata/" + name, ({detail: hand})=> {
      this.textContent = hand.children[0]?.text || "None"
    })
  }
}

export const makeHand = (session : Session, name : string) => {
  return new Hand(session, name)
}

window.customElements.define("illthorn-hand", Hand)