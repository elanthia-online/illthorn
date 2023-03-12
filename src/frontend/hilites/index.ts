type HilitesProfile =
  { patterns : Record<string, string>
  , groups   : Record<string, Record<string, string>>
  }

const HEX_COLOR = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i

const _CACHE : Array<[RegExp, string]> = []

export async function loadHilites () {
  const loaded = await window.Settings.get<HilitesProfile>("hilites")
  if (loaded) return loaded
  return {patterns: {}, groups: {}} as HilitesProfile
}

export function makeStylesheet () {
  const style = document.createElement("style")
  style.id = "hilites"
  style.appendChild(document.createTextNode(""))
  // Add the <style> element to the page
  document.head.appendChild(style)
  return style
}

export function getSheet() {
  const styleEle =
    document.querySelector<HTMLStyleElement>("#hilites") ||
    makeStylesheet()
  return styleEle.sheet
}

export function resetSheet() {
  const sheet = getSheet()
  if (!sheet) return
  while (sheet.rules.length) sheet.removeRule(0)
}

export function insertGroupRule(group : string, rules : Record<string, string>) {
  const sheet = getSheet()
  if (!sheet) return
  Object.entries(rules).forEach(([rule, value]) => {
    sheet.addRule(`.${group}`, `${rule}: ${value}`)
  })
}

export function isValidHexColor(color : string) {
  return HEX_COLOR.test(color)
}

export function isHiliteRegex(hilite : string) {
  return hilite[0] == "/" && hilite[hilite.length - 1] == "/"
}

export async function reloadHilites() {
  resetSheet()
  const settings = await loadHilites()

  Object.entries(settings.groups).forEach(
    ([group, rules]) => insertGroupRule(group, rules))

  _CACHE.length = 0

  Object.entries(settings.patterns)
    .forEach(([pattern, color]) => _CACHE
      .push([deserializeHilites(pattern), color]))

  return _CACHE
}

export function getCachedHilites () {
  return _CACHE
}

export function deserializeHilites(hilite : string) {
  if (isHiliteRegex(hilite))
    return new RegExp(hilite.slice(1, hilite.length - 2), "g")
  return new RegExp(hilite, "g")
}

export function serializeHilites(hilite : string) {
  return (isHiliteRegex(hilite)
    ? new RegExp(hilite.slice(1, hilite.length - 2), "g")
    : new RegExp(hilite, "g")
  ).toString()
}

export function addPattern(group : string, pattern : string) {

}

export function addGroup(group : string, rules : Record<string, string>) {

}

export function remotePattern(pattern : string) {

}

export function removeGroup(group : string) {

}



