export class Panel extends HTMLElement {
  constructor (title : string, content : HTMLElement | HTMLElement[]) {
    super()
    const details = document.createElement("details")
    const summary = document.createElement("summary")
    summary.textContent = title
    details.append(summary)
    Array.isArray(content) 
      ? details.append(...content)
      : details.append(content)
    details.open = true
    this.append(details)
  }
}

window.customElements.define("illthorn-panel", Panel)