import { ipcRenderer as IPC } from "electron"
import { SettingsMethods } from "./methods"

export async function load () {
  return await IPC.invoke(SettingsMethods.Load)
}

export async function set (key : string, value : any) {
  return await IPC.invoke(SettingsMethods.Set, {key, value})
}

export async function get (key : string) {
  return await IPC.invoke(SettingsMethods.Get, key)
}
