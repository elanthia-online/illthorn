import Mark from "mark.js"
import { getCachedHilites } from "./index"

export async function addHilites (frag : DocumentFragment) : Promise<void> {
  const hilites = getCachedHilites()
  if (hilites.length == 0) return
  const mark = new Mark(frag as any)
  await hilites.reduce(async (io, [pattern, group])=> {
    await io
    return await new Promise(resolve => {
      mark.markRegExp(pattern,
        {className: group, done: ()=> resolve(null)})
    })
  }, Promise.resolve(null))
}
