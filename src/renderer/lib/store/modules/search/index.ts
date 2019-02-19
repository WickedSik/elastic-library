import { SearchActions } from './actions'
import { SearchState } from './design'

export const initialState:SearchState = {
    errors: [],
    results: [],
    subjects: [],
    total: 0
}

export type SearchState = SearchState

export function searchReducer(state:SearchState = initialState, action: SearchActions):SearchState {
    if(action.type === 'eslib/search/SEARCH_REQUEST') {
        return {
            ...state,
            errors: []
        }
    }
    if(action.type === 'eslib/search/SEARCH_SUCCESS') {
        return {
            ...state,
            total: action.payload.total,
            results: action.payload.rows
        }
    }
    if(action.type === 'eslib/search/SEARCH_FAILURE') {
        return {
            ...state,
            results: [],
            errors: action.payload
        }
    }
    if(action.type === 'eslib/search/SEARCH_SUCCESS_ADD') {
        return {
            ...state,
            total: action.payload.total,
            results: [...state.results, action.payload.rows]
        }
    }
    if(action.type === 'eslib/search/SUBJECT_LIST_REQUEST') {
        return {
            ...state,
            subjects: [],
            errors: []
        }
    }
    if(action.type === 'eslib/search/SUBJECT_LIST_SUCCESS') {
        return {
            ...state,
            subjects: action.payload
        }
    }
    if(action.type === 'eslib/search/SUBJECT_LIST_FAILURE') {
        return {
            ...state,
            subjects: [],
            errors: action.payload
        }
    }
    if(action.type === 'eslib/search/FETCH_DOCUMENT_REQUEST') {
        return {
            ...state,
            errors: [],
            document: undefined
        }
    }
    if(action.type === 'eslib/search/FETCH_DOCUMENT_SUCCESS') {
        return {
            ...state,
            document: action.payload
        }
    }
    if(action.type === 'eslib/search/FETCH_DOCUMENT_FAILURE') {
        return {
            ...state,
            errors: action.payload
        }
    }
    if(action.type === 'eslib/search/DELETE_DOCUMENT_REQUEST') {
        return {
            ...state,
            errors: []
        }
    }
    if(action.type === 'eslib/search/DELETE_DOCUMENT_SUCCESS') {
        return {
            ...state,
            results: state.results ? state.results.filter((doc:any) => doc.id !== action.payload) : []
        }
    }
    if(action.type === 'eslib/search/DELETE_DOCUMENT_FAILURE') {
        return {
            ...state,
            errors: action.payload
        }
    }

    return state
}

