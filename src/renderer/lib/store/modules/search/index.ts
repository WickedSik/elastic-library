import _ from 'lodash'
import saga from './saga'

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
    DELETE_DOCUMENT_SUCCESS
} from './actiontypes'
import { AnyAction } from 'redux';

export interface SearchState {
    errors: any[]
    results: any[]
    subjects: any[]
    total: number
    document?: any
}

const initialState:SearchState = {
    errors: [],
    results: [],
    subjects: [],
    total: 0
}

export default (state = initialState, action:AnyAction) => {
    console.info('-- reduce', action.type)
    console.groupEnd()
    switch (action.type) {
        case SEARCH_REQUEST:
            return {
                ...state,
                errors: []
            }

        case SEARCH_FAILED:
            return {
                ...state,
                results: [],
                errors: action.payload
            }

        case SEARCH_SUCCESS:
            return {
                ...state,
                total: action.payload.total,
                results: action.payload.rows
            }

        case SEARCH_SUCCESS_ADD:
            return {
                ...state,
                total: action.payload.total,
                results: _.concat(state.results || [], action.payload.rows)
            }

        case SUBJECT_LIST_REQUEST:
            return {
                ...state,
                subjects: [],
                errors: []
            }

        case SUBJECT_LIST_FAILED:
            return {
                ...state,
                subjects: [],
                errors: action.payload
            }

        case SUBJECT_LIST_SUCCESS:
            return {
                ...state,
                subjects: action.payload
            }

        case FETCH_DOCUMENT_REQUEST:
            return {
                ...state,
                document: null
            }

        case FETCH_DOCUMENT_FAILED:
            return {
                ...state,
                errors: action.payload
            }

        case FETCH_DOCUMENT_SUCCESS:
            return {
                ...state,
                document: action.payload
            }

        case DELETE_DOCUMENT_SUCCESS:
            return {
                ...state,
                results: state.results ? state.results.filter((doc:any) => doc.id !== action.payload) : []
            }

        default:
            return {
                ...state
            }
    }
}

export { saga }
