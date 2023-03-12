import type { GameTag } from "../../parser/tag"
import { type FrontendSession as Session } from "../../session/index"
import { ProgressBar } from "./progress-bar"

export class Effects extends HTMLElement {
  constructor (readonly session : Session, readonly name: string) {
    super()
    this.classList.add(name.toLocaleLowerCase().replace(/\s/g, "-"))
    this.session.bus.subscribeEvent<GameTag>("metadata/dialogData/" + name,
      ({detail: dialog})=> this.renderDialog(dialog))
  }

  renderDialog (dialog : GameTag) {
    this.innerHTML = ""
    if (dialog.children.length == 0) return
    const progressBars = dialog.children.filter(child => child.name == "progressBar")
    progressBars.forEach(bar => {
      const {text, id, time, value} = bar.attrs
      //console.log("dialog/%s", this.name, bar.attrs)
      const progressEle = new ProgressBar(text + "")
      progressEle.dataset.spellId = id + ""
      progressEle.updateText("" + text)
      progressEle.updateValue(("" + time).replace(/^0/, ""))
      progressEle.updatePercent(value + "")
      this.append(progressEle)
    })
  }
}

window.customElements.define("illthorn-effects", Effects)
