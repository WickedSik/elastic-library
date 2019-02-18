// Required to prevent errors by TS
declare global {
    interface Window {
        require(path:string):{
            webFrame:any
            ipcRenderer:any
        }
    }
}

import React from 'react'
import ReactDOM from 'react-dom'

import Application from './Application'

const { webFrame } = window.require('electron')

// console.info('-- webframe', webFrame)

webFrame.registerURLSchemeAsPrivileged('booru')
webFrame.registerURLSchemeAsPrivileged('api')
webFrame.registerURLSchemeAsPrivileged('image')
webFrame.registerURLSchemeAsPrivileged('video')

ReactDOM.render(<Application />, document.getElementById('root'))
