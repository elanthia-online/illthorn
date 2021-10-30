import { GameTag } from "../../parser/tag"
import type { Session } from "../../session"
import { ProgressBar } from "./progress-bar"

export class Vitals extends HTMLElement {
  
  constructor ( readonly session : Session
              , readonly health : ProgressBar = new ProgressBar("health")
              , readonly stamina : ProgressBar = new ProgressBar("stamina")
              , readonly spirit : ProgressBar = new ProgressBar("spirit")
              , readonly mana : ProgressBar = new ProgressBar("mana")
              , readonly mind : ProgressBar = new ProgressBar("mind")
              , readonly stance : ProgressBar = new ProgressBar("stance")
              , readonly encum : ProgressBar = new ProgressBar("encum")) {
    super()
    this.render()
    this.attachListeners()
  }

  render () {
    this.append(
      this.health,
      this.stamina,
      this.spirit,
      this.mana,
      this.mind,
      this.stance,
      this.encum
    )
  }

  bindBarEvent (feedId : string, bar : ProgressBar) {
    this.session.bus.subscribeEvent<GameTag>(`metadata/progressBar/${feedId}`, 
      ({detail: feedInfo})=> this.updateState(bar, feedInfo))
  }

  attachListeners () {
    this.bindBarEvent("pbarStance", this.stance)
    this.bindBarEvent("mindState", this.mind)
    this.bindBarEvent("encumlevel", this.encum)

    this.bindBarEvent("mana", this.mana)
    this.bindBarEvent("health", this.health)
    this.bindBarEvent("stamina", this.stamina)
    this.bindBarEvent("spirit", this.spirit)
  }

  updateState (bar : ProgressBar, {attrs} : GameTag) {
    //console.log("vitals/update", attrs)
    const userText = attrs.text  || ":unknown"
    const percent  = attrs.value || "-1"
    bar.setAttribute("title", userText as string)
    bar.setAttribute("percent", percent as string)
  }
}

window.customElements.define("illthorn-vitals", Vitals)