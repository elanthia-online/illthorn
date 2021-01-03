const electron = require("electron")
const Command = require("../command")
const windowStateKeeper = require("electron-window-state")
const Session = require("../../session")

// TODO: Pull in abstracted versions of these commands?
// const quit = require("./quit")
// const connect = require("./connect")

// TODO: Should this stuff be extracted into a function to share with the Window creation stuff in `main.js`?

exports["new-window"] = Command.of(["name"], async ({ name }) => {
  // Step 1) Quit old session
  const candidates = Session.fuzzy_find(name)

  if (candidates.length > 1) {
    throw new Error(
      `Ambigious match for name(${name}) found ${candidates.length} matches`
    )
  }

  if (candidates.length == 0) {
    throw new Error(`No matches found for name(${name})`)
  }

  candidates[0].destroy()

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
  newWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  // TODO: Figure out how to run a connect in the NEW Window
  // Step 3) Connect Session
  // attempt to autodetect what port to connect to
  // if (!argv.port) {
  // let portAndName = {
  //   name: name,
  // }
  // const running = await Autodetect.list()

  // const auto_detected = running.find(
  //   ({ name }) => ~name.indexOf(argv.name)
  // )

  // if (!auto_detected) {
  //   throw new Error(`could not find a session by the name ${name}`)
  // }

  // Object.assign(portAndName, auto_detected)
  // // }

  // if (Session.has(name)) {
  //   throw new Error(`Session(name: ${name}) already exists`)
  // }

  // const session = await Session.of(portAndName)
  // redraw(session)
})
