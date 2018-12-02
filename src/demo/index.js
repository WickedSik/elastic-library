import React from 'react'
import ReactDOM from 'react-dom'
// import Raven from 'raven'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

// Raven.config('https://40db1016f052405b8464d41bcaca698e@sentry.io/1248073').install()

const { webFrame } = window.require('electron')

// console.info('-- webframe', webFrame)

webFrame.registerURLSchemeAsPrivileged('booru')
webFrame.registerURLSchemeAsPrivileged('api')
webFrame.registerURLSchemeAsPrivileged('image')
webFrame.registerURLSchemeAsPrivileged('video')

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
