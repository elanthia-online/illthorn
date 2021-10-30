import type { GameTag } from "../../parser/tag"
import type { Session } from "../../session"
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
      const timeEle = document.createElement("span")
      timeEle.classList.add("time")
      timeEle.textContent = ("" + time).replace(/^0/, "")
      progressEle.append(timeEle)
      progressEle.updatePercent(value + "")
      this.append(progressEle)
    })
  }
}

window.customElements.define("illthorn-effects", Effects)