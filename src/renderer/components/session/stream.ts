export class Stream extends HTMLElement {

}

export function makeStream (...classes: string[]) {
  const stream = new Stream()
  stream.classList.add(...classes)
  return stream
}

window.customElements.define("illthorn-stream", Stream)