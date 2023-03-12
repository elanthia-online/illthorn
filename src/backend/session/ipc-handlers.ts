import { ipcMain as Backend } from "electron"
import { SessionMethods } from "./methods"
import { log } from "../logger"
import { BackendSession } from "."
import { SessionMap } from "./map"

log("attaching session ipc handlers")

Backend.handle(SessionMethods.Connect, async (_event, config : Illthorn.Session.Config)=> {
  try {
    return (await BackendSession.connect(config)).toJSON()
  } catch (err) {
    return err
  }
})

Backend.handle(SessionMethods.ListConnected, ()=> {
  return Array.from(SessionMap).map(([_name, session])=> session.toJSON())
})

Backend.handle(SessionMethods.ListAvailable, async ()=> {
  return BackendSession.listAvailable()
})

Backend.handle(SessionMethods.SendCommand, async (_event, req : {to: string, command : string}) => {
  const session = SessionMap.get(req.to)
  if (!session) {
    throw new Error(`no session found for ${req.to}`)
  }

  session.sock.write(req.command + "\r\n")
  return {ok: true}
})