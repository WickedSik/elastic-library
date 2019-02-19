import React from 'react'
import { Provider, connect } from 'react-redux'
import _ from 'lodash'
import $ from 'jquery'
import 'foundation-sites'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import 'react-notifications/lib/notifications.css'

import '../assets/app.scss'

import store from './lib/store'
import * as actions from './lib/store/modules/search/actions'

import Header from './lib/components/navigation/Header'
import CardList from './lib/components/media/CardList'
import BulkActionBar from './lib/components/media/CardList/BulkActionBar'
import SideNav from './lib/components/navigation/SideNav'
import SettingsDialog from './lib/components/partials/SettingsDialog'
import Document from './lib/components/Document'
import ImagePreloader from './lib/components/loaders/ImagePreloader'
import KeyCodes from './lib/constants/KeyCodes'
import { RootState } from './lib/store/modules'

import Config from '../config'

// const fs = electron.remote.require('fs')
const { ipcRenderer } = window.require('electron')

const loader = new ImagePreloader()
Document.globalOn('loaded', (doc:Document) => {
    // console.info('-- doc:loaded', doc.attributes.image)
    loader.add(doc.url)
})

let log = ''
ipcRenderer.on('command', (_:any, message:any) => {
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

interface AppPropTypes {
    subjectList: Function
    search: Function
    delete: Function
    results: Document[]
    total: number
}

interface AppState {
    bulkSelection: string[]
    settingsOpen: boolean
    dialogType: string
    searchterm: string
    sort: string
}

class App extends React.Component<AppPropTypes, AppState> {
    state:AppState = {
        bulkSelection: [],
        settingsOpen: false,
        dialogType: 'dialog',
        searchterm: '',
        sort: 'no'
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
                                onRequestSelected={(i:string) => {
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

    _handleSearch = (term:string) => {
        this.setState({
            bulkSelection: [],
            searchterm: term
        })

        console.info('-- search', term, Config.search.sortingOptions[this.state.sort])

        this.props.search(term, 0, Config.search.sortingOptions[this.state.sort])
    }

    _handleRequestMore = () => {
        this.props.search(this.state.searchterm, this.props.results.length, this.state.sort, true)
    }

    _switchDialogType = () => {
        this.setState((state) => {
            return {
                dialogType: state.dialogType === 'dialog' ? 'overlay' : 'dialog'
            }
        })
    }

    _switchSort = () => {
        this.setState((state) => {
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

    _bulkSelect = (id:string) => {
        this.setState(state => ({
            bulkSelection: [...state.bulkSelection, id]
        }))
    }

    _bulkDeselect = (id:string) => {
        this.setState(state => ({
            bulkSelection: state.bulkSelection.filter(r => r !== id)
        }))
    }

    _handleKeydown = (event:KeyboardEvent) => {
        if (KeyCodes.getCharacterFromCode(event.keyCode) === 'f') {
            this._switchDialogType()
        }
    }
}

const ConnectedApp = connect(
    (state:RootState) => {
        return {
            total: state.search ? state.search.total : 0,
            results: state.search ? state.search.results : []
        }
    },
    dispatch => {
        return {
            search(terms:string, position:number, sort:any, more:boolean) {
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
            delete(id:string) {
                dispatch(actions.deleteDocument(id))
            }
        }
    }
)(App)

export default class Wrapper extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <ConnectedApp />
            </Provider>
        )
    }
}
