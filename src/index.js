import React from 'react';
import ReactDOM from 'react-dom';

import './css/index.css';

import Application from './js/App';
import registerServiceWorker from './js/registerServiceWorker';

ReactDOM.render(<Application />, document.getElementById('root'));
registerServiceWorker();
