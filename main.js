// ./main.js
const electron = require('electron')
const Server = require('electron-rpc/server')
const Raven = require('raven')
const ImageHandler = require('./lib/images')
const BooruHandler = require('./lib/booru')
// const Connector = require('./server/connector')

Raven.config('https://40db1016f052405b8464d41bcaca698e@sentry.io/1248073').install()

const { app, BrowserWindow } = electron
const rpc = new Server()
// const connector = new Connector(rpc)

// rpc.on('loaded', (req, next) => {
//     console.info('-- rpc:loaded', req)

//     if (!connector.connected) {
//         connector.init()
//     }

//     next()
// })

let win = null

const images = new ImageHandler()
const booru = new BooruHandler()
electron.protocol.registerStandardSchemes([ImageHandler.PROTOCOL])
electron.protocol.registerStandardSchemes([BooruHandler.PROTOCOL])

function createWindow() {
    images.register(electron.protocol)
    booru.register(electron.protocol)

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

    console.info('== app data path', app.getPath('userData'))

    electron.protocol.isProtocolHandled(BooruHandler.PROTOCOL, function(x) {
        console.info('== is protocol handled:', BooruHandler.PROTOCOL, x)
    })
    electron.protocol.isProtocolHandled(ImageHandler.PROTOCOL, function(x) {
        console.info('== is protocol handled:', ImageHandler.PROTOCOL, x)
    })

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
