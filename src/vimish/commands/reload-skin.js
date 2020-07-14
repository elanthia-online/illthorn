const Command = require("../command")
const Bus = require("../../bus")
const CustomCSS = require("../../storage/custom-css")

exports["reload-skin"] = Command.of([], async () => {
  await CustomCSS.injectCSS()
  Bus.emit(Bus.events.FLASH, {
    kind: "ok",
    message: "successfully reloaded your skin",
  })
})
