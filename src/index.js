import React from 'react'
import ReactDOM from 'react-dom'

import Application from './demo/App'
import registerServiceWorker from './demo/registerServiceWorker'

const { webFrame } = window.require('electron')
webFrame.registerURLSchemeAsPrivileged('image')

ReactDOM.render(<Application />, document.getElementById('root'))
registerServiceWorker()
