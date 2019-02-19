import { call, put, takeLatest, takeEvery } from 'redux-saga/effects'

import searchApi from './api'
import Document from '../../../components/Document'
import { IActionSearchSearcRequest, IActionSearchSubjectListRequest, IActionSearchFetchRequest, IActionSearchDeleteRequest } from './actions'

const SUBJECT_LIST_QUERY = {
    index: 'media',
    type: 'media',
    body: {
        size: 0,
        aggs: {
            keywords: {
                terms: {
                    field: 'keywords.keyword',
                    order: { '_count': 'desc' },
                    size: 10000
                }
            }
        }
    }
}

function* search(actionObject:IActionSearchSearcRequest) {
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
            rows: results.hits.hits.map((hit:any) => new Document(hit))
        }

        if (actionObject.payload.add) {
            yield put({ type: 'eslib/search/SEARCH_SUCCESS_ADD', payload: data })
        } else {
            yield put({ type: 'eslib/search/SEARCH_SUCCESS', payload: data })
        }
    } catch (e) {
        yield put({ type: 'eslib/search/SEARCH_FAILURE', payload: [e] })
    }
}

function* subjectList(actionObject:IActionSearchSubjectListRequest) {
    try {
        const results = yield call(searchApi.search, SUBJECT_LIST_QUERY)

        const data = results.aggregations.keywords.buckets.filter((bucket:any) => {
            return bucket.doc_count > 1
        })

        yield put({ type: 'eslib/search/SUBJECT_LIST_SUCCESS', payload: data })
    } catch (e) {
        yield put({ type: 'eslib/search/SUBJECT_LIST_FAILURE', payload: [e] })
    }
}

function* fetch(actionObject:IActionSearchFetchRequest) {
    try {
        const document = yield call(searchApi.fetch, actionObject.payload)
        const doc = new Document(document)

        yield put({ type: 'eslib/search/FETCH_DOCUMENT_SUCCESS', payload: doc })
    } catch (e) {
        yield put({ type: 'eslib/search/FETCH_DOCUMENT_FAILURE', payload: [e] })
    }
}

function* deleteDocument(actionObject:IActionSearchDeleteRequest) {
    try {
        yield call(searchApi.deleteDocument, actionObject.payload)

        yield put({ type: 'eslib/search/DELETE_DOCUMENT_SUCCESS', payload: actionObject.payload.id })
    } catch (e) {
        yield put({ type: 'eslib/search/DELETE_DOCUMENT_FAILURE', payload: [e] })
    }
}

export function* searchWatcher() {
    yield takeLatest('eslib/search/SEARCH_REQUEST', search)
    yield takeLatest('eslib/search/SUBJECT_LIST_REQUEST', subjectList)
    yield takeEvery('eslib/search/FETCH_DOCUMENT_REQUEST', fetch)
    yield takeEvery('eslib/search/DELETE_DOCUMENT_REQUEST', deleteDocument)
}