// ./main.js
const electron = require('electron')
const Server = require('electron-rpc/server')
const path = require('path')
// const child_process = require('child_process')
const config = require('./config.json')
const {
    default: installExtension,
    REACT_DEVELOPER_TOOLS,
    REDUX_DEVTOOLS,
    REACT_PERF
} = require('electron-devtools-installer')

const { app, BrowserWindow } = electron
const rpc = new Server()

const devExtensions = [
    REACT_DEVELOPER_TOOLS,
    REDUX_DEVTOOLS,
    REACT_PERF
]
devExtensions.map(ext => {
    installExtension(ext)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch(() => {}) // ignore
})

let win = null
let handlers = []

const load = process.env.NODE_ENVIRONMENT === 'production'
    ? { APP_URL: path.resolve(__dirname, 'public/index.html'), loader: 'loadFile' }
    : { APP_URL: 'http://localhost:3000', loader: 'loadURL' }

const handlersToLoad = config.handlers || []

handlersToLoad.forEach(h => {
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
    win.webContents.session.clearStorageData()

    // Specify entry point
    win[load.loader](load.APP_URL)

    rpc.configure(win.webContents)

    // Show dev tools
    // Remove this line before distributing
    win.webContents.openDevTools()

    // Remove window once app is closed
    win.on('closed', function() {
        win = null
    })

    // electron.ipcMain.on('message', (_, message) => {
    //     console.info('>> main (window):', message)
    //     const { event } = message

    //     switch (event) {
    //         default:
    //             bgSendMessage(event, message)
    //     }
    // })
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

// let webpack
// if (process.env.NODE_ENVIRONMENT !== 'production') {
//     webpack = child_process.spawn('/usr/local/bin/node', ['scripts/start.js'], {
//         env: {
//             BROWSER: 'false'
//         }
//     })

//     webpack.on('error', error => {
//         console.error('-- webpack:', error)
//     })

//     webpack.on('message', message => {
//         console.info('-- webpack:', message)
//     })

//     webpack.on('close', () => {
//         console.info('-- webpack:close')
//         app.quit()
//     })
// }

// const bg = child_process.fork('bg/process.js', [], { silent: false })
// const bgSendMessage = function(event, payload) {
//     console.info('main >>:', event)
//     bg.send(JSON.stringify({ event, payload }))
// }

// bg.on('exit', () => {
//     console.info('bg died')
// })

// bg.on('message', message => {
//     console.info('>> main:', message)
//     const { event } = message

//     switch (event) {
//         case 'init':
//             win[load.loader](load.APP_URL)
//             break
//         default:
//             win.webContents.send('message', message)
//     }
// })

app.on('before-quit', () => {
    console.info('-- app:before-quit')
    // webpack && !webpack.killed && webpack.kill()
    // bg && !bg.killed && bg.kill()
})
