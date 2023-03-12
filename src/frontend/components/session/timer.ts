export class Timer extends HTMLElement {
  static events = {
    TIMER_START: 'timerstart'
  }
}

export function makeTimer (...classes: string[]) {
  const stream = new Timer()
  stream.classList.add(...classes)
  return stream
}

export function spawnTimer(timer : Timer, end : string) {
  // gs timers are second precision vs millisecond
  const endMilliseconds = parseInt(end, 10) * 1000
  const timerStart = new CustomEvent(Timer.events.TIMER_START, {detail: endMilliseconds})
  timer.dispatchEvent(timerStart)
}

window.customElements.define("illthorn-timer", Timer)