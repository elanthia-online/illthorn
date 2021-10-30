import { GameTag } from "../../parser/tag"
import type { Session } from "../../session/index"

export class Room extends HTMLElement {
  constructor ( readonly session : Session
              , readonly idEle : HTMLSpanElement = document.createElement("span")
              , readonly titleEle: HTMLSpanElement = document.createElement("span")) {
      super()
      this.render()
      this.attachListeners()
      
    }

  render () {
    this.append(
      this.idEle,
      this.titleEle)
  }

  attachListeners () {
    this.session.bus.subscribeEvent<GameTag>("metadata/nav", ({detail: nav})=> {
      //console.log(nav)
      this.idEle.textContent = nav.attrs.rm as string
    })

    this.session.bus.subscribeEvent<GameTag>("metadata/streamWindow/room", ({detail: streamWindow})=> {
      const title = (streamWindow.attrs.subtitle || "").toString()
      this.titleEle.textContent = title.replace(/^\s\-\s/, "")
    })
  }

}

window.customElements.define("illthorn-room", Room)