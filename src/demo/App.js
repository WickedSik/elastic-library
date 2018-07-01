import React from 'react'
import PropTypes from 'prop-types'
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { Provider, connect } from 'react-redux'
import _ from 'lodash'

import './app.scss'

import reducer from '../lib/redux/reducers'
import mySaga from '../lib/redux/sagas'
import actions from '../lib/redux/actions'

import Header from '../lib/components/layout/navigation/Header'
import CardList from '../lib/components/layout/media/CardList'

import Config from '../config'

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
        open: false,
        searchterm: ''
    }

    componentWillMount() {
        this.props.subjectList()
        this._handleSearch('favorite:true')
    }

    render() {
        const { results, total } = this.props
        const search = _.debounce(this._handleSearch, 250, { trailing: true })
        const requestMore = _.debounce(this._handleRequestMore, 250, { trailing: true })

        return (
            <div className='App'>
                <div>
                    <Header onSearch={search} term={this.state.searchterm} />
                    <CardList results={results} total={total} onRequestMore={requestMore} onDelete={this.props.delete} />
                </div>
            </div>
        )
    }

    _handleToggle = () => {
        this.setState({open: !this.state.open})
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
}

App = connect(
    (state, props) => {
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
