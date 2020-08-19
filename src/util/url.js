exports.open_external_link = (url) => {
  // console.log("opening:url(%s)", url)
  require("electron").shell.openExternal(url)
  return false
}
