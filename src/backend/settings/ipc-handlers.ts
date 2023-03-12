import { ipcMain as Backend } from "electron"
import Store from "electron-store"
import { SettingsMethods } from "./methods"
import { log } from "../logger"

log("attaching settings ipc handlers")

const store = new Store()

log("binding settings at: %s", store.path)

Backend.handle(SettingsMethods.Load, async ()=> {
  return store.store
})

Backend.handle(SettingsMethods.Set, async (_e, {key, value} : {key : string, value : any})=> {
  return store.set(key, value)
})

Backend.handle(SettingsMethods.Get, async (_e, key : string)=> {
  return store.get(key)
})
