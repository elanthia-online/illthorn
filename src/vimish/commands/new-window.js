const electron = require("electron")
const Command = require("../command")
const windowStateKeeper = require("electron-window-state")
const quitSession = require("../functions/quitSession.js")
const connectSession = require("../functions/connectSession.js")

exports["new-window"] = Command.of(["name"], async ({ name }) => {
  // Step 1) Quit old session
  quitSession(name)

  // Step 2) Create new Window
  let newWindow

  //define default window state
  let newWindowState = windowStateKeeper({
    defaultWidth: 1500,
    defaultHeight: 1000,
  })

  // Create the browser window.
  const BrowserWindow = electron.remote.BrowserWindow
  newWindow = new BrowserWindow({
    //set window state
    x: newWindowState.x,
    y: newWindowState.y,
    width: newWindowState.width,
    height: newWindowState.height,
    show: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    titleBarStyle: "hidden",
    icon: "/src/app/img/app-icon.png",
  })

  newWindowState.manage(newWindow)

  newWindow.show()

  // and load the index.html of the app.
  // can't open DevTools in new one.
  newWindow.loadURL(
    `${MAIN_WINDOW_WEBPACK_ENTRY}?character=${name}&port=???`
  )

  // TODO: Figure out how to run a connect in the NEW Window
  // Step 3) Connect Session
  // connectSession(argv)
})
