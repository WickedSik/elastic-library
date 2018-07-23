// ./main.js
const electron = require('electron')
const Server = require('electron-rpc/server')
const ImageHandler = require('./lib/images')
const Connector = require('./server/connector')

const { app, BrowserWindow } = electron
const rpc = new Server()
const connector = new Connector(rpc)

rpc.on('loaded', (req, next) => {
    console.info('-- rpc:loaded', req)

    if (!connector.connected) {
        connector.init()
    }

    next()
})

let win = null

const images = new ImageHandler()
images.config(electron.protocol)

function createWindow() {
    images.register(electron.protocol)

    // Initialize the window to our specified dimensions
    win = new BrowserWindow({
        width: 1000,
        height: 600
    })

    // Specify entry point
    win.loadURL('http://localhost:3000')

    rpc.configure(win.webContents)

    // Show dev tools
    // Remove this line before distributing
    win.webContents.openDevTools()

    // Remove window once app is closed
    win.on('closed', function() {
        win = null
    })
}

app.on('ready', function() {
    createWindow()
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})

app.on('window-all-closed', function() {
    app.quit()
})
