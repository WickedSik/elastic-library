import { call, put, takeLatest, takeEvery } from 'redux-saga/effects'
import searchApi from './api'

import {
    SEARCH_REQUEST,
    SEARCH_SUCCESS,
    SEARCH_SUCCESS_ADD,
    SEARCH_FAILED,
    SUBJECT_LIST_REQUEST,
    SUBJECT_LIST_SUCCESS,
    SUBJECT_LIST_FAILED,
    FETCH_DOCUMENT_REQUEST,
    FETCH_DOCUMENT_SUCCESS,
    FETCH_DOCUMENT_FAILED,
    DELETE_DOCUMENT_REQUEST,
    DELETE_DOCUMENT_SUCCESS,
    DELETE_DOCUMENT_FAILED
} from './actiontypes'
import { dispatchAction } from '../index'

import Document from '../../../components/Document'

function* search(actionObject) {
    try {
        const query = actionObject.payload.query

        if (actionObject.payload.size) {
            query.body.size = actionObject.payload.size
        }

        if (actionObject.payload.position) {
            query.body.from = actionObject.payload.position
        }

        const results = yield call(searchApi.search, query)

        const data = {
            total: results.hits.total,
            rows: results.hits.hits.map(hit => new Document(hit))
        }

        if (actionObject.payload.add) {
            yield put(dispatchAction(SEARCH_SUCCESS_ADD, data))
        } else {
            yield put(dispatchAction(SEARCH_SUCCESS, data))
        }
    } catch (e) {
        yield put(dispatchAction(SEARCH_FAILED, e.message))
    }
}

function* subjectList(actionObject) {
    try {
        const results = yield call(searchApi.search, actionObject.payload)

        yield put(dispatchAction(SUBJECT_LIST_SUCCESS, results.aggregations.keywords.buckets.filter(bucket => {
            return bucket.doc_count > 1
        })))
    } catch (e) {
        yield put(dispatchAction(SUBJECT_LIST_FAILED, e.message))
    }
}

function* fetch(actionObject) {
    try {
        const document = yield call(searchApi.fetch, actionObject.payload)

        yield put(dispatchAction(FETCH_DOCUMENT_SUCCESS, new Document(document)))
    } catch (e) {
        yield put(dispatchAction(FETCH_DOCUMENT_FAILED, e.message))
    }
}

function* deleteDocument(actionObject) {
    try {
        yield call(searchApi.deleteDocument, actionObject.payload)

        yield put(dispatchAction(DELETE_DOCUMENT_SUCCESS, actionObject.payload.id))
    } catch (e) {
        yield put(dispatchAction(DELETE_DOCUMENT_FAILED, e.message))
    }
}

export default [
    takeLatest(SEARCH_REQUEST, search),
    takeLatest(SUBJECT_LIST_REQUEST, subjectList),
    takeEvery(FETCH_DOCUMENT_REQUEST, fetch),
    takeEvery(DELETE_DOCUMENT_REQUEST, deleteDocument)
]
