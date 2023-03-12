// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from "electron"
import * as SessionAPI from "./backend/session/mainworld-api"
import * as AppAPI from "./backend/app/mainworld-api"
import * as SettingsAPI from "./backend/settings/mainworld-api"

contextBridge.exposeInMainWorld("Session", SessionAPI)
contextBridge.exposeInMainWorld("App", AppAPI)
contextBridge.exposeInMainWorld("Settings", SettingsAPI)