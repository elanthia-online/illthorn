import { ipcRenderer as IPC } from "electron"
import { AppMethods } from "./methods"

export async function setTitle (title : string) {
  return await IPC.send(AppMethods.SetTile, {title})
}
