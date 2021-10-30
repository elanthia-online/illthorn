/**
 * detects active Lich/Urnon sessions in a cross platform compatible way
 * todo: make Lich create the `.session` files
 */
import Electron from "electron"
import path from "path"
import { promises as fs } from "fs"
import { focusSession, makeSession, Session } from "."

export async function exists (path) {
  try {
    await fs.stat(path)
    return true
  } catch (err) {
    return false
  }
}

export async function detectScriptingSessions () {
  const tmpDir = Electron.remote.app.getPath("temp")
  const scriptingSessionDir = path.join(tmpDir, "simutronics", "sessions")
  if (! await exists(scriptingSessionDir)) {
    return console.warn("no scripting session dir exists at %s", scriptingSessionDir)
  }
  const files = (await fs.readdir(scriptingSessionDir))
    .map(file => path.join(scriptingSessionDir, file))
  
  const sessions = files.map(async (file)=> {
    try {
      const contents = await fs.readFile(file)
      const sessionInfo = JSON.parse(contents.toString())
      return await makeSession(sessionInfo)
    } catch (err) {
      console.warn(err)
      return {err: true}
    }
  })

  const firstSession = (await Promise.all(sessions))
    .find(sess => sess instanceof Session)

  if (firstSession instanceof Session) focusSession(firstSession)
  console.log(firstSession)
}