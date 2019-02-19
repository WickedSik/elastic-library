import { Store, createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'

import { state, initialState, RootState, rootSaga } from './modules'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const sagaMiddleware = createSagaMiddleware()

const enhancer = compose(
    applyMiddleware(sagaMiddleware)
)

const store:Store<RootState> = createStore(
    state,
    initialState,
    enhancer
)

sagaMiddleware.run(rootSaga)

export default store
