import { ipcRenderer as IPC } from "electron"
import { SessionMethods } from "./methods"

export async function connect ({name, port} : Illthorn.Session.Config, callback : (message: Electron.IpcRendererEvent)=> void): Promise<Illthorn.Session.Pojo> {
  const session = await IPC.invoke(SessionMethods.Connect, {name, port})
  await registerSingletonListener(name + "/lich/message", callback)
  return session
}

export async function listConnected (): Promise<Array<Illthorn.Session.Pojo>> {
  return IPC.invoke(SessionMethods.ListConnected)
}

export async function listAvailable (): Promise<Array<Illthorn.LichSessionDescriptor>> {
  return IPC.invoke(SessionMethods.ListAvailable)
}

export async function registerSingletonListener (eventName : string, callback : (message: Electron.IpcRendererEvent)=> void) {
  // cleanup zombies
  if (IPC.eventNames().includes(eventName)) {
    IPC.listeners(eventName).forEach(listener => {
      IPC.removeListener(eventName, listener as any)
    })
  }
  IPC.on(eventName, callback)
  return {ok: true}
}

export async function sendCommand (session : Illthorn.Session.Pojo, command : string) {
  IPC.invoke(SessionMethods.SendCommand, {to: session.name, command})
}