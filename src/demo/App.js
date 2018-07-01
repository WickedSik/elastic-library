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

import Config from '../config'

fontawesome.library.add(regular, solid)

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

class App extends React.Component {
    static propTypes = {
        subjectList: PropTypes.func.isRequired,
        search: PropTypes.func.isRequired,
        delete: PropTypes.func.isRequired,
        results: PropTypes.array,
        total: PropTypes.number
    }

    state = {
        searchterm: ''
    }

    componentDidMount() {
        $(document).foundation()
    }

    componentWillMount() {
        this.props.subjectList()
        this._handleSearch('keywords:Ninjakitty')
    }

    render() {
        const { results, total } = this.props
        const search = _.debounce(this._handleSearch, 250, { trailing: true })
        const requestMore = _.debounce(this._handleRequestMore, 250, { trailing: true })

        return (
            <div className='app-container'>
                <div className={'off-canvas position-left'} id={'sidebarMenu'} data-off-canvas>
                    <SideNav onSearch={search} />
                </div>
                <div className={'off-canvas-content'} data-off-canvas-content>
                    <Header onSearch={search} term={this.state.searchterm} offCanvasId={'sidebarMenu'} />
                    <CardList results={results} total={total} onRequestMore={requestMore} onDelete={this.props.delete} />
                </div>
            </div>
        )
    }

    _handleSearch = (term) => {
        // a little bit creative... I am strongly considering throwing Foundation out again
        // and doing it myself (once again ._. )
        $(document).find('#sidebarMenu').length && $(document).find('#sidebarMenu').foundation('close')

        this.setState({
            searchterm: term
        })

        this.props.search(term)
    }

    _handleRequestMore = () => {
        this.props.search(this.state.searchterm, this.props.results.length, true)
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
