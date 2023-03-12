import { GameTag } from "../../parser/tag"
import { type FrontendSession as Session } from "../../session/index"
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
    this.encum.classList.add("inverted")
    this.mind.classList.add("inverted")
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
    //this.bindBarEvent("pbarStance", this.stance)
    //this.bindBarEvent("encumlevel", this.encum)

    this.bindBarEvent("mana", this.mana)
    this.bindBarEvent("health", this.health)
    this.bindBarEvent("stamina", this.stamina)
    this.bindBarEvent("spirit", this.spirit)

    this.session.bus.subscribeEvent<GameTag>(`metadata/progressBar/encumlevel`,
      ({detail: feedInfo})=> {
        const {attrs} = feedInfo
        const value = (attrs.text || "") + ""
        this.encum.setAttribute("title", "encumbrance")
        this.encum.setAttribute("percent", (attrs.value || "") + "")
        this.encum.setAttribute("value", value.toLowerCase())
      })

    this.session.bus.subscribeEvent<GameTag>(`metadata/progressBar/pbarStance`,
      ({detail: feedInfo})=> {
        const {attrs} = feedInfo
        const value = (attrs.text || "") + ""
        const humanizedValue = value.split(/\s/)[0] || value
        this.stance.setAttribute("title", "stance")
        this.stance.setAttribute("percent", (attrs.value || "") + "")
        this.stance.setAttribute("value", humanizedValue)
      })

    this.session.bus.subscribeEvent<GameTag>(`metadata/progressBar/mindState`,
      ({detail: feedInfo})=> {
        const {attrs} = feedInfo
        this.mind.setAttribute("title", "mind")
        this.mind.setAttribute("percent", (attrs.value || "") + "")
        this.mind.setAttribute("value", (attrs.text || "") + "")
      })
  }

  updateState (bar : ProgressBar, {attrs} : GameTag) {
    //console.log("vitals/update", attrs)
    const [userText, value] = (attrs.text  || ":unknown").toString().split(" ")
    const percent  = attrs.value || "-1"
    bar.setAttribute("title", userText as string)
    bar.setAttribute("percent", percent as string)
    bar.setAttribute("value", value || "")
  }
}

window.customElements.define("illthorn-vitals", Vitals)
