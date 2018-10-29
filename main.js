// ./main.js
const electron = require('electron')
const Server = require('electron-rpc/server')
// const Raven = require('raven')
const path = require('path')
const config = require('./config.json')

const ImageHandler = require('./lib/images')
const BooruHandler = require('./lib/booru')
const ApiHandler = require('./lib/booru')
// const Connector = require('./server/connector')

// Raven.config('https://40db1016f052405b8464d41bcaca698e@sentry.io/1248073').install()

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
let handlers = []

;(config.handlers || []).forEach(h => {
    // console.info('-- handler:%s', h)
    const Handler = require('./lib/' + h)
    const handler = new Handler()
    electron.protocol.registerStandardSchemes([Handler.PROTOCOL])

    handlers.push((protocol) => {
        handler.register(protocol)
    })
})

function createWindow() {
    handlers.forEach(handler => {
        handler(electron.protocol)
    })

    // Initialize the window to our specified dimensions
    win = new BrowserWindow({
        width: 1000,
        height: 600,
        icon: path.join(__dirname, 'src/assets/icons/1024x1024')
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
