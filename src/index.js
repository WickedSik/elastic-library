import React from 'react'
import ReactDOM from 'react-dom'

import Application from './demo/App'
import registerServiceWorker from './demo/registerServiceWorker'

ReactDOM.render(<Application />, document.getElementById('root'))
registerServiceWorker()
