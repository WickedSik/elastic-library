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

import Config from '../config'

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
            open: false,
            searchterm: ''
        }
    }

    componentWillMount() {
        this.props.subjectList()
        this.handleSearch('favorite:true')
    }

    handleToggle = () => this.setState({open: !this.state.open});

    handleSearch(term) {
        console.info('-- search:handle', term)

        this.setState({
            searchterm: term
        })
        this.props.search(term)
    }

    handleRequestMore() {
        this.props.search(this.state.searchterm, this.props.results.length, true)
    }

    render() {
        const { results } = this.props
        const search = _.debounce(this.handleSearch.bind(this), 250, { trailing: true })
        const requestMore = _.debounce(this.handleRequestMore.bind(this), 250, { trailing: true })

        return (
            <div className="App">
                <MuiThemeProvider theme={palette}>
                    <div>
                        <Header onSearch={search} term={this.state.searchterm} />
                        <CardList results={results} onRequestMore={requestMore} />
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
            search(terms, position, more) {
                const query = {
                    index: Config.search.index,
                    type: Config.search.type,
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
                        ]
                    }
                }

                dispatch(actions.search(query, Config.search.size, position || 0, more))
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
