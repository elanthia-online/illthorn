import { type WebContents } from "electron"

let webContents : WebContents = undefined
export function setWebContents (newWebContents : WebContents) {
  webContents = newWebContents
}

export function useWebContents (): WebContents {
  return webContents!
}