import os from "os"
import path from "path"
import fs from "fs/promises"
import * as json from "../util/json"

const scriptingSessionDir = path.join(os.tmpdir(), "simutronics", "sessions")

export async function detectLichSessions () : Promise<Illthorn.LichSessionDescriptor[]>  {
  if (! await json.exists(scriptingSessionDir)) {
    console.warn("no scripting session dir exists at %s", scriptingSessionDir)
    return []
  }

  const pendingSessions = (await fs.readdir(scriptingSessionDir))
    .map(async (file : string) => await json.read<Illthorn.LichSessionDescriptor>(path.join(scriptingSessionDir, file)))
  
  const sessions = await Promise.all(pendingSessions)
    
  return sessions.sort((a, b) => a.port - b.port)
}
