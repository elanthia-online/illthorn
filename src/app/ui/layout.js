const Settings = require("../../settings").of("ui")

module.exports = function () {
  const LayoutSettings = Settings

  const RIGHT_PANELS_ON_CLASS = "right-panels-on"

  const rightPanels = LayoutSettings.get("right-panels", false)
  if (rightPanels) {
    window.app.classList.add(RIGHT_PANELS_ON_CLASS)
  }
}
