// ./main.js
const electron = require('electron')
const Server = require('electron-rpc/server')
const path = require('path')
const child_process = require('child_process')
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

const handlersToLoad = (config.handlers || []).map(h => {
    // console.info('-- handler:%s', h)
    const Handler = require('./lib/' + h)
    const handler = new Handler()

    handlers.push((protocol) => {
        handler.register(protocol)
    })

    return Handler
})

console.info('-- handlers:', handlersToLoad.map(h => h.PROTOCOL))

electron.protocol.registerStandardSchemes(handlersToLoad.map(h => h.PROTOCOL))

console.info('-- registered')

function createWindow() {
    handlers.forEach(handler => {
        handler(electron.protocol)
    })

    console.info('-- handlers registered')

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

    electron.ipcMain.on('command', ({ sender }, message) => {
        console.info('>> main (window):', message)
        const { command, args } = message

        runCommand(command, args, sender)
    })
}

function runCommand(exec, args = [], sender) {
    let p = child_process.spawn('/usr/local/bin/node', ['bg/process.js', exec, ...args], {
        env: {
            ...process.env,
            FORCE_COLOR: 0
        }
    })
    p.unref()

    p.stderr.on('data', chunk => {
        sender.send('command', { event: 'process:error', chunk: chunk.toString() })
    })
    p.stdout.on('data', chunk => {
        sender.send('command', { event: 'process:message', chunk: chunk.toString() })
    })

    p.on('error', error => {
        console.error('-- process:', error)
    })

    p.on('message', message => {
        console.info('-- process:', message)
    })

    p.on('close', () => {
        console.info('-- process:close')
        sender.send('command', { event: 'process:ended', command: exec })
    })

    sender.send('command', { event: 'process:started' })
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

app.on('before-quit', () => {
    console.info('-- app:before-quit')
})
