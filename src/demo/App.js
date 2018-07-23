import React from 'react'
import PropTypes from 'prop-types'
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { Provider, connect } from 'react-redux'
import _ from 'lodash'
import $ from 'jquery'
import 'foundation-sites'

import fontawesome from '@fortawesome/fontawesome'
import regular from '@fortawesome/fontawesome-free-regular'
import solid from '@fortawesome/fontawesome-free-solid'

import './app.scss'

import reducer from '../lib/redux/reducers'
import mySaga from '../lib/redux/sagas'
import actions from '../lib/redux/actions'

import Header from '../lib/components/navigation/Header'
import CardList from '../lib/components/media/CardList'
import SideNav from '../lib/components/navigation/SideNav'
import SettingsDialog from '../lib/components/partials/SettingsDialog'

import Config from '../config'

fontawesome.library.add(regular, solid)

// const fs = electron.remote.require('fs')
const Client = window.require('electron-rpc/client')

// create the saga middleware
const sagaMiddleware = createSagaMiddleware()
// mount it on the Store

/* eslint-disable no-underscore-dangle */
const store = createStore(
    reducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(sagaMiddleware)
)
/* eslint-enable */

// then run the saga
sagaMiddleware.run(mySaga)

const rpc = new Client()

rpc.on('imported', (err, data) => {
    console.info('-- imported', err, data)
})

rpc.on('import-total', (err, data) => {
    console.info('-- rpc:total', err, data)
})

class App extends React.Component {
    static propTypes = {
        subjectList: PropTypes.func.isRequired,
        search: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired,
        results: PropTypes.array,
        total: PropTypes.number
    }

    state = {
        settingsOpen: false,
        dialogType: 'dialog',
        searchterm: ''
    }

    componentDidMount() {
        $(document).foundation()

        rpc.request('loaded')
    }

    componentWillMount() {
        this.props.subjectList()
        this._handleSearch('keywords:*')
    }

    render() {
        const { results, total } = this.props
        const search = _.debounce(this._handleSearch, 250, { trailing: true })
        const requestMore = _.debounce(this._handleRequestMore, 250, { trailing: true })

        return (
            <div className='app-container'>
                <div className={'grid-x'}>
                    <div className={'cell small-12'}>
                        <Header
                            dialogType={this.state.dialogType}
                            term={this.state.searchterm}
                            onRequestOpenSettings={this._openSettings}
                            onRequestSwitchDialogType={this._switchDialogType}
                            onSearch={search}
                        />
                    </div>
                    <div className={'cell small-2'}>
                        <SideNav onSearch={search} />
                    </div>
                    <div className={'cell small-10'}>
                        <CardList
                            dialogType={this.state.dialogType}
                            results={results}
                            total={total}
                            onRequestSwitchDialogType={this._switchDialogType}
                            onRequestMore={requestMore}
                            onRequestDelete={this.props.delete}
                        />
                    </div>

                    {this.state.settingsOpen && (
                        <SettingsDialog onRequestClose={this._closeSettings} />
                    )}
                </div>
            </div>
        )
    }

    _handleSearch = (term) => {
        this.setState({
            searchterm: term
        })

        this.props.search(term)
    }

    _handleRequestMore = () => {
        this.props.search(this.state.searchterm, this.props.results.length, true)
    }

    _switchDialogType = () => {
        this.setState(state => {
            return {
                dialogType: state.dialogType === 'dialog' ? 'overlay' : 'dialog'
            }
        })
    }

    _openSettings = () => {
        this.setState({
            settingsOpen: true
        })
    }

    _closeSettings = () => {
        this.setState({
            settingsOpen: false
        })
    }
}

App = connect(
    (state) => {
        return {
            total: state.search ? state.search.total : 0,
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
            },
            delete(id) {
                dispatch(actions.deleteDocument(id))
            }
        }
    }
)(App)

export default class Wrapper extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <App />
            </Provider>
        )
    }
}
