//import { IllthornEvent } from "../events"

type Handler<T> = (a : CustomEvent<T>)=>void

export class Bus {
  constructor (readonly _ele : HTMLDivElement = document.createElement("div")) {
  }

  dispatchEvent <T>(name : string, detail : T) : void {
    const e = new CustomEvent(name as any, {detail})
    this._ele.dispatchEvent(e)
  }

  subscribeEvent <T>(name : string, handler : Handler<T>) {
    this._ele.addEventListener(name as any, handler)
  }
}

/*
const _BUS = document.createElement("div")

const _illthornEvent = (name : IllthornEvent)=> "illthorn://" + name

type Handler<T> = (a : CustomEvent<T>)=>void

export function dispatchEvent (name: IllthornEvent.PROMPT_UPDATE, detail: HTMLElement): void;
export function dispatchEvent (name: IllthornEvent.SUBMIT_GAME_COMMAND, detail: string): void;
export function dispatchEvent (name: IllthornEvent.SUBMIT_ILLTHORN_COMMAND, detail: string): void;
export function dispatchEvent (name: IllthornEvent.SESSION_NEW, detail: Session): void;
export function dispatchEvent<T>(name : IllthornEvent, detail? : T) {
  const e = new CustomEvent(
    _illthornEvent(name), 
    {detail})
  _BUS.dispatchEvent(e)
}

export function subscribeEvent (name: IllthornEvent.PROMPT_UPDATE, detail: Handler<HTMLElement>): void;
export function subscribeEvent (name: IllthornEvent.SUBMIT_GAME_COMMAND, detail: Handler<string>): void;
export function subscribeEvent (name: IllthornEvent.SUBMIT_ILLTHORN_COMMAND, detail: Handler<string>): void;
export function subscribeEvent (name: IllthornEvent.SESSION_NEW, detail: Handler<Session>): void;
export function subscribeEvent <T>(name : IllthornEvent, handler : Handler<T>) {
  _BUS.addEventListener(
    _illthornEvent(name) as any,
    handler
  )
}
*/