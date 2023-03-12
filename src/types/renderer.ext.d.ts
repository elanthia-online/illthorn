import { type Illthorn } from "src/frontend/state"

interface IPCEventCallback {
  (e: Electron.IpcRendererEvent, message : any): void
}

type Ok = 
  {ok: true
  }

type Noop =
  {noop: true
  }

export interface ISessionAPI {
  async connect (config : Illthorn.Session.Config, callback: IPCEventCallback)
  async registerSingletonListener (eventName: string, callback: IPCEventCallback): Noop | Ok
  async listAvailable (): Array<Illthorn.LichSessionDescriptor>
  async listConnected(): Array<Illthorn.Session.Pojo>
  async sendCommand(session : Illthorn.Session.Pojo, command : string): Ok
}

export interface IAppAPI {
  setTitle(config : {title: string}): void;
}

export interface ISettingsAPI<T = Record<string, any>> {
  async load (): T
  async get<A>(key : string): A|undefined
  async set<V>(key : string, value : V): void
}

declare global {
  interface Window {
    Session: ISessionAPI
    App: IAppAPI
    Settings : ISettingsAPI
    Illthorn: typeof Illthorn
  }
}