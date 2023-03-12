import { ipcMain as Backend, BrowserWindow } from "electron"
import { AppMethods } from "./methods"
import { log } from "../logger"
import { useWebContents } from "../webcontents"

log("attaching app ipc handlers")

Backend.handle(AppMethods.SetTile, async (event, {title}: {title : string})=> {
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  win.setTitle(title)
})
