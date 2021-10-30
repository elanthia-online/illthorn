export class ProgressBar extends HTMLElement {
  static get observedAttributes() {
    return ["title", "percent"]
  }
  constructor ( readonly name  : string
              , readonly text  : HTMLSpanElement = document.createElement("span")
              , readonly meter : HTMLSpanElement = document.createElement("span")) {
    super()
    this.classList.add(name.toLocaleLowerCase().replace(/\s+/g, "-"))
    this.meter.classList.add("meter")
    this.text.classList.add("flavor-text")
    this.append(meter, text)
  }
  
  attributeChangedCallback(name : string, oldValue : string, newValue : string) {
    switch (name) {
      case "title":
        return this.updateText(newValue)
      case "percent":
        return this.updatePercent(newValue)
    }
  }

  updateText (text : string) {
    this.text.textContent = text
  }

  updatePercent (percentEmptyStr : string) {
    const percentRemaining = parseInt(percentEmptyStr)
    this.meter.style.width = percentRemaining + "%"
    this.classList.toggle("high", percentRemaining > 66)
    this.classList.toggle("medium", percentRemaining < 66 && percentRemaining > 33)
    this.classList.toggle("low", percentRemaining < 33)
  }
}

window.customElements.define("illthorn-progress-bar", ProgressBar)