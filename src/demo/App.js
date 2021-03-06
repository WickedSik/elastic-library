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
import * as searchActions from '../lib/store/modules/search/actions'
import { toggleFullscreen } from '../lib/store/modules/dialog/actions'

import Header from '../lib/components/navigation/Header'
import CardList from '../lib/components/media/CardList'
import BulkActionBar from '../lib/components/media/CardList/BulkActionBar'
import SideNav from '../lib/components/navigation/SideNav'
import SettingsDialog from '../lib/components/partials/SettingsDialog'
import Document from '../lib/components/Document'
import ImagePreloader from '../lib/components/loaders/ImagePreloader'
import KeyCodes from '../lib/constants/KeyCodes'

import Config from '../config'

// const fs = electron.remote.require('fs')
const { ipcRenderer } = window.require('electron')
const store = configureStore()

const loader = new ImagePreloader()
Document.globalOn('loaded', doc => {
    // console.info('-- doc:loaded', doc.attributes.image)
    loader.add(doc.url)
})

window.__ipc__ = ipcRenderer

let log = ''
ipcRenderer.on('command', (_, message) => {
    const { event, chunk, command } = message

    if (event === 'process:ended') {
        console.info('-- process', log)
        NotificationManager.info(`Process ${command} ended:\n${log}`, 'Finished')
    }

    if (event === 'process.message') {
        log += chunk.toString()
    }

    if (event === 'process.started') {
        log = ''
    }
})

class App extends React.Component {
    static propTypes = {
        subjectList: PropTypes.func.isRequired,
        search: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired,
        toggleFullscreen: PropTypes.func.isRequired,
        results: PropTypes.array,
        total: PropTypes.number,
        dialogType: PropTypes.string.isRequired
    }

    state = {
        bulkSelection: [],
        settingsOpen: false,
        searchterm: '',
        sort: 'no',
        sortDirection: 'desc'
    }

    componentDidMount() {
        document.addEventListener('keydown', this._handleKeydown, false)

        $(document).foundation()

        // ipcRenderer.send('message', { event: 'import' })
    }

    componentWillMount() {
        this.props.subjectList()
        this._handleSearch(Config.search.defaultSearch)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this._handleKeydown, false)
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
                                dialogType={this.props.dialogType}
                                term={this.state.searchterm}
                                sort={this.state.sort}
                                sortDirection={this.state.sortDirection}
                                onRequestOpenSettings={this._openSettings}
                                onRequestSwitchDialogType={this.props.toggleFullscreen}
                                onRequestSwitchSort={this._switchSort}
                                onRequestSwitchSortDirection={this._switchSortDirection}
                                onSearch={search}
                            />
                        </div>
                        <div className={'cell small-12'}>
                            <CardList
                                dialogType={this.props.dialogType}
                                bulkSelection={bulkSelection}
                                results={results}
                                total={total}
                                onRequestSwitchDialogType={this.props.toggleFullscreen}
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

        const sort = {
            [Config.search.sortingOptions[this.state.sort]]: this.state.sortDirection
        }
        this.props.search(term, 0, sort)
    }

    _handleRequestMore = () => {
        this.props.search(this.state.searchterm, this.props.results.length, this.sort, true)
    }

    _switchSortDirection = () => {
        this.setState(state => {
            return {
                bulkSelection: [],
                sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc'
            }
        }, () => {
            console.info('-- sort', this.state.searchterm, Config.search.sortingOptions[this.state.sort], this.state.sortDirection)
            const sort = {
                [Config.search.sortingOptions[this.state.sort]]: this.state.sortDirection
            }

            this.props.search(this.state.searchterm, 0, sort)
        })
    }

    _switchSort = () => {
        this.setState(state => {
            return {
                bulkSelection: [],
                sort: state.sort === 'yes' ? 'no' : 'yes'
            }
        }, () => {
            console.info('-- sort', this.state.searchterm, Config.search.sortingOptions[this.state.sort], this.state.sortDirection)
            const sort = {
                [Config.search.sortingOptions[this.state.sort]]: this.state.sortDirection
            }

            this.props.search(this.state.searchterm, 0, sort)
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

    _handleKeydown = (event) => {
        if (KeyCodes.getCharacterFromCode(event.keyCode) === 'f') {
            this.props.toggleFullscreen()
        }
    }
}

App = connect(
    (state) => {
        return {
            dialogType: state.dialog.fullscreen ? 'overlay' : 'dialog',
            total: state.search ? state.search.total : 0,
            results: state.search ? state.search.results : []
        }
    },
    dispatch => {
        return {
            search(terms, position, sort, more) {
                console.info('-- demo:search', { terms, position, sort, more })

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

                dispatch(searchActions.search(query, Config.search.size, position || 0, more))
            },
            subjectList() {
                dispatch(searchActions.subjectList())
            },
            delete(id) {
                dispatch(searchActions.deleteDocument(id))
            },
            toggleFullscreen() {
                dispatch(toggleFullscreen())
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
