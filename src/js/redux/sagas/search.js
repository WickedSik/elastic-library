import { call, put, takeLatest } from 'redux-saga/effects'
import searchApi from '../api/search'

import * as ActionTypes from '../ActionTypes'
import { action } from './index'

// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function* search(actionObject) {
   try {
      const results = yield call(searchApi.search, actionObject.payload);

      console.info('-- search:result', results);

      yield put(action(ActionTypes.SEARCH_SUCCESS, results.hits.hits));
   } catch (e) {
      yield put(action(ActionTypes.SEARCH_FAILED, e.message));
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

export default [
    takeLatest(ActionTypes.SEARCH_REQUEST, search),
    takeLatest(ActionTypes.SUBJECT_LIST_REQUEST, subjectList)
];