import _ from 'lodash'

import * as ActionTypes from '../ActionTypes'

const search = (state, action) => {
    switch (action.type) {

        case ActionTypes.SEARCH_REQUEST:
            return {
                ...state,
                errors: [],
            }

        case ActionTypes.SEARCH_FAILED:
            return {
                ...state,
                results: [],
                errors: action.payload,
            }

        case ActionTypes.SEARCH_SUCCESS:
            return {
                ...state,
                total: action.payload.total,
                results: action.payload.rows,
            }

        case ActionTypes.SEARCH_SUCCESS_ADD:
            return {
                ...state,
                total: action.payload.total,
                results: _.concat(state.results || [], action.payload.rows),
            }

        case ActionTypes.SUBJECT_LIST_REQUEST:
            return {
                ...state,
                subjects: [],
                errors: [],
            }

        case ActionTypes.SUBJECT_LIST_FAILED:
            return {
                ...state,
                subjects: [],
                errors: action.payload,
            }

        case ActionTypes.SUBJECT_LIST_SUCCESS:
            return {
                ...state,
                subjects: action.payload,
            }

        case ActionTypes.FETCH_DOCUMENT_REQUEST:
            return {
                ...state,
                document: null
            }

        case ActionTypes.FETCH_DOCUMENT_FAILED:
            return {
                ...state,
                errors: action.payload
            }

        case ActionTypes.FETCH_DOCUMENT_SUCCESS:
            return {
                ...state,
                document: action.payload
            }

        case ActionTypes.DELETE_DOCUMENT_REQUEST:
            return {
                ...state
            }

        case ActionTypes.DELETE_DOCUMENT_FAILED:
            return {
                ...state
            }

        case ActionTypes.DELETE_DOCUMENT_SUCCESS:
            return {
                ...state,
                results: state.results ? state.results.filter(doc => doc.id !== action.payload) : []
            }

        default:
            return {
                ...state
            };
    }
}

export default search