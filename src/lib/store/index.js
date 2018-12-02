import { createStore, compose, applyMiddleware, combineReducers } from 'redux'
import createSagaMiddleware from 'redux-saga'

import { reducers, rootSaga } from './modules'

export default function configureStore() {
    const sagaMiddleware = createSagaMiddleware()
    const composeCreateStore = () => compose(
        applyMiddleware(sagaMiddleware),
        window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : fn => fn
    )(createStore)

    const finalCreateStore = composeCreateStore()

    const store = finalCreateStore(combineReducers({ ...reducers }))

    sagaMiddleware.run(rootSaga)

    return store
}
