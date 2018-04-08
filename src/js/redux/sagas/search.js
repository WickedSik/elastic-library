import { call, put, takeLatest, takeEvery } from 'redux-saga/effects'
import searchApi from '../api/search'

import * as ActionTypes from '../ActionTypes'
import { action } from './index'

import { Document } from '../../models'

function* search(actionObject) {
    try {
        const query = actionObject.payload.query

        if(actionObject.payload.size) {
            query.body.size = actionObject.payload.size
        }

        if(actionObject.payload.position) {
            query.body.from = actionObject.payload.position
        }

        const results = yield call(searchApi.search, query)

        if(actionObject.payload.add) {
            yield put(action(ActionTypes.SEARCH_SUCCESS_ADD, results.hits.hits.map(hit => new Document(hit))))
        } else {
            yield put(action(ActionTypes.SEARCH_SUCCESS, results.hits.hits.map(hit => new Document(hit))))
        }
    } catch (e) {
        yield put(action(ActionTypes.SEARCH_FAILED, e.message))
    }
}

function* subjectList(actionObject) {
    try {
        const results = yield call(searchApi.search, actionObject.payload);

        yield put(action(ActionTypes.SUBJECT_LIST_SUCCESS, results.aggregations.keywords.buckets.filter(bucket => {
            return bucket.doc_count > 1
        })))
    } catch(e) {
        yield put(action(ActionTypes.SUBJECT_LIST_FAILED, e.message))
    }
}

function* fetch(actionObject) {
    try {
        const document = yield call(searchApi.fetch, actionObject.payload)

        yield put(action(ActionTypes.FETCH_DOCUMENT_SUCCESS, new Document(document)))
    } catch(e) {
        yield put(action(ActionTypes.FETCH_DOCUMENT_FAILED, e.message))
    }
}

export default [
    takeLatest(ActionTypes.SEARCH_REQUEST, search),
    takeLatest(ActionTypes.SUBJECT_LIST_REQUEST, subjectList),
    takeEvery(ActionTypes.FETCH_DOCUMENT_REQUEST, fetch),
];