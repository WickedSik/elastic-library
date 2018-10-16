import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

const { webFrame } = window.require('electron')

// console.info('-- webframe', webFrame)

webFrame.registerURLSchemeAsPrivileged('booru')

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
