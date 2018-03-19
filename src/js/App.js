import React, { Component } from 'react';
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import { connect } from "react-redux"
import _ from 'lodash'

import '../css/App.css'

import { createMuiTheme } from 'material-ui/styles';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import reducer from './redux/reducers'
import mySaga from './redux/sagas'
import actions from './redux/actions'

import Header from './layout/navigation/Header'
import CardList from './layout/media/CardList'

// import CardList from './cards/CardList'

const palette = createMuiTheme({}, {
    userAgent: false
})

// create the saga middleware
const sagaMiddleware = createSagaMiddleware()
// mount it on the Store

/* eslint-disable no-underscore-dangle */
const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(sagaMiddleware),
)
/* eslint-enable */

// then run the saga
sagaMiddleware.run(mySaga)

class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            open: false
        }
    }

    componentWillMount() {
        this.props.subjectList()
        this.props.search('favorite:true')
    }

    handleToggle = () => this.setState({open: !this.state.open});

    render() {
        const search = _.debounce(this.props.search, 250, { trailing: true });

        return (
            <div className="App">
                <MuiThemeProvider theme={palette}>
                    <div>
                        <Header onSearch={(x) => { search(x) }} />
                        <CardList />
                    </div>
                </MuiThemeProvider>
            </div>
        );
    }
}

App = connect(
    (state, props) => {
        return {
            results: state.search ? state.search.results : []
        }
    },
    dispatch => {
        return {
            search(terms) {
                const query = {
                    index: 'media',
                    type: 'media',
                    body: {
                        query: {
                            bool: {
                                must: {
                                    query_string: {
                                        query: terms
                                    }
                                }
                            }
                        },
                        sort: [
                            { 'file.updated_at': 'desc' }
                        ],
                        size: 50
                    }
                }

                dispatch(actions.search(query))
            },
            subjectList() {
                dispatch(actions.subjectList())
            }
        }
    }
)(App)

class Wrapper extends Component {
    render() {
        return (
            <Provider store={store}>
                <App/>
            </Provider>
        )
    }
}

export default Wrapper;
