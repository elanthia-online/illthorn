import { FrontendSession } from "."
import { focusSession, renderSessionsMenu } from "./helpers"

export async function connectAll () {
  const lichSessions = await window.Session.listAvailable()
  const oldConnections = await window.Session.listConnected()
  const allSessions : Array<Illthorn.LichSessionDescriptor|Illthorn.Session.Pojo> = [...lichSessions, ...oldConnections]
  const sessions = await Promise.all(allSessions.map(descriptor => FrontendSession.connect(descriptor)))
  console.log("sessions=%o", sessions)
  return sessions
}

export async function renderAllSessions() {
  const sessions = await connectAll()
  const firstSession = sessions[0]
  if (firstSession) focusSession(firstSession)
  renderSessionsMenu()
}