import { createStore, compose, applyMiddleware, combineReducers } from 'redux'
import createSagaMiddleware from 'redux-saga'

import { reducers, rootSaga } from './modules'

export default function configureStore() {
    const sagaMiddleware = createSagaMiddleware()

    function composeCreateStore():(reducers:any) => any {
        return compose<any, any>(
            applyMiddleware(sagaMiddleware),
            window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : (fn:Function) => fn
        )
    }

    const finalCreateStore = composeCreateStore()(createStore)

    const store = finalCreateStore(combineReducers({ ...reducers }))

    sagaMiddleware.run(rootSaga)

    return store
}
