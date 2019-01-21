import React from 'react'
import PropTypes from 'prop-types'
import { Provider, connect } from 'react-redux'
import _ from 'lodash'
import $ from 'jquery'
import 'foundation-sites'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import 'react-notifications/lib/notifications.css'

import './app.scss'

import configureStore from '../lib/store'
import * as actions from '../lib/store/modules/search/actions'

import Header from '../lib/components/navigation/Header'
import CardList from '../lib/components/media/CardList'
import BulkActionBar from '../lib/components/media/CardList/BulkActionBar'
import SideNav from '../lib/components/navigation/SideNav'
import SettingsDialog from '../lib/components/partials/SettingsDialog'
import Document from '../lib/components/Document'
import ImagePreloader from '../lib/components/loaders/ImagePreloader'

import Config from '../config'

// const fs = electron.remote.require('fs')
const Client = window.require('electron-rpc/client')
const { ipcRenderer } = window.require('electron')
const store = configureStore()

const rpc = new Client()

rpc.on('imported', (err, data) => {
    console.info('-- imported', err, data)
})

rpc.on('import-total', (err, data) => {
    console.info('-- rpc:total', err, data)
})

const loader = new ImagePreloader()
Document.globalOn('loaded', doc => {
    // console.info('-- doc:loaded', doc.attributes.image)
    loader.add(doc.url)
})

ipcRenderer.on('message', (event, message) => {
    console.info('-- message', message.data && message.data.source, message, event)

    if (message.event !== 'ping') {
        NotificationManager.info(message.event, 'Background Process', 10000)
    }
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
        bulkSelection: [],
        settingsOpen: false,
        dialogType: 'dialog',
        searchterm: '',
        sort: 'no'
    }

    componentDidMount() {
        $(document).foundation()

        rpc.request('loaded')
        // ipcRenderer.send('message', { event: 'import' })
    }

    componentWillMount() {
        this.props.subjectList()
        this._handleSearch(Config.search.defaultSearch)
    }

    render() {
        const { results, total } = this.props
        const { bulkSelection } = this.state
        const search = _.debounce(this._handleSearch, 250, { trailing: true })
        const requestMore = _.debounce(this._handleRequestMore, 250, { trailing: true })

        return (
            <div className={'off-canvas-wrapper'}>
                <div className={'off-canvas position-left'} id={'offCanvas'} data-off-canvas>
                    <SideNav onSearch={search} />
                </div>
                <div className={'app-container off-canvas-content'} data-off-canvas-content>
                    <div className={'grid-x'}>
                        <div className={'cell small-12'}>
                            <Header
                                dialogType={this.state.dialogType}
                                term={this.state.searchterm}
                                sort={Config.search.sortingOptions[this.state.sort]}
                                onRequestOpenSettings={this._openSettings}
                                onRequestSwitchDialogType={this._switchDialogType}
                                onRequestSwitchSort={this._switchSort}
                                onSearch={search}
                            />
                        </div>
                        <div className={'cell small-12'}>
                            <CardList
                                dialogType={this.state.dialogType}
                                bulkSelection={bulkSelection}
                                results={results}
                                total={total}
                                onRequestSwitchDialogType={this._switchDialogType}
                                onRequestMore={requestMore}
                                onRequestDelete={this.props.delete}
                                onRequestSearch={this._handleSearch}
                                onRequestSelected={i => {
                                    if (bulkSelection.indexOf(i) === -1) {
                                        this._bulkSelect(i)
                                    } else {
                                        this._bulkDeselect(i)
                                    }
                                }}
                            />
                            {bulkSelection.length > 0 && (
                                <BulkActionBar bulkSelection={bulkSelection.map(i => results[i])} />
                            )}
                        </div>

                        {this.state.settingsOpen && (
                            <SettingsDialog onRequestClose={this._closeSettings} />
                        )}
                    </div>
                </div>

                <NotificationContainer />
            </div>
        )
    }

    _handleSearch = (term) => {
        this.setState({
            bulkSelection: [],
            searchterm: term
        })

        console.info('-- search', term, Config.search.sortingOptions[this.state.sort])

        this.props.search(term, 0, Config.search.sortingOptions[this.state.sort])
    }

    _handleRequestMore = () => {
        this.props.search(this.state.searchterm, this.props.results.length, this.sort, true)
    }

    _switchDialogType = () => {
        this.setState(state => {
            return {
                dialogType: state.dialogType === 'dialog' ? 'overlay' : 'dialog'
            }
        })
    }

    _switchSort = () => {
        this.setState(state => {
            return {
                bulkSelection: [],
                sort: state.sort === 'yes' ? 'no' : 'yes'
            }
        }, () => {
            console.info('-- sort', this.state.searchterm, Config.search.sortingOptions[this.state.sort])

            this.props.search(this.state.searchterm, 0, Config.search.sortingOptions[this.state.sort])
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

    _bulkSelect = (id) => {
        this.setState(state => ({
            bulkSelection: [...state.bulkSelection, id]
        }))
    }

    _bulkDeselect = (id) => {
        this.setState(state => ({
            bulkSelection: state.bulkSelection.filter(r => r !== id)
        }))
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
            search(terms, position, sort, more) {
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
                        sort
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
