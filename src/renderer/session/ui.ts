import {CLI} from "../components/session/cli"
import { Prompt } from "../components/session/prompt"
import { Context } from "../components/context"
import { Feed } from "../components/session/feed"
import { Compass } from "../components/session/compass"
import {makeHand, Hand}   from "../components/session/hand"
import { Vitals } from "../components/session/vitals"
import {Panel} from "../components/session/panel"
import { Room } from "../components/session/room"
import { Effects } from "../components/session/effects"
import {div} from "../util/dom"
import type { Session } from "../session"

export type SessionUI =
  { context : Context
  ; cli     : CLI
  ; feed    : Feed
  ; prompt  : Prompt
  ; vitals  : Vitals
  ; streams : HTMLDivElement
  ; hands   : { left: Hand, right: Hand, spell: Hand }
  }

export function makeSessionUI (session : Session): SessionUI {
  // wrapper for an app context
  const context = new Context()
  context.classList.add("session", session.name)

  const hud   = div({classes: "hud"})
  const main  = div({classes: "main"})

  context.append(hud, main)
  /** left / hud */
  const compass = new Compass(session)
  const room    = new Room(session)
  const vitals  = new Vitals(session)
  const activeSpells = new Effects(session, "Active Spells")
  const buffs        = new Effects(session, "Buffs")
  const cooldowns    = new Effects(session, "Cooldowns")
  const debuffs      = new Effects(session, "Debuffs")

  hud.append(
    new Panel("room", [room, compass]),
    new Panel("vitals", vitals),
    new Panel("active spells", activeSpells),
    new Panel("buffs", buffs),
    new Panel("cooldowns", cooldowns),
    new Panel("debuffs", debuffs)
  )

  /** main  **/

  // hands related ui components
  const handsContainer = div({classes: "hands"})
  const left           = makeHand(session, "left")
  const right          = makeHand(session, "right")
  const spell          = makeHand(session, "spell")
  const hands          = {left, right, spell}
  handsContainer.append(left, right, spell)

  // feeds and streams
  const streams = div({classes: "streams"})
  const feed    = new Feed(session)

  // cli related ui components
  const commandBar     = div({classes: "cli-wrapper"})
  const cli            = new CLI(session)
  const prompt         = new Prompt(session)
  commandBar.append(prompt, cli)
  
  main.append(handsContainer, streams, feed, commandBar)
  return {context, vitals, cli, feed, prompt, streams, hands}
}