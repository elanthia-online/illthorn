const { app, BrowserWindow } = require("electron")
const path = require("path")
const windowStateKeeper = require("electron-window-state")

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit()
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const createWindow = () => {
  //define default window state
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1500,
    defaultHeight: 1000,
  })
  // Create the browser window.
  mainWindow = new BrowserWindow({
    //set window state
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    show: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
    },
    titleBarStyle: "hidden",
    icon: "./build/icons/64x64.png",
  })
  mainWindowState.manage(mainWindow)

  mainWindow.show()

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // Open the DevTools.
  if (process.env.ENV == "dev")
    mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow)

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
