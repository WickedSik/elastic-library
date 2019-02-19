
import { Action } from 'redux'
import { GetParams, DeleteDocumentParams } from 'elasticsearch'
import Document from '@src/renderer/lib/components/Document'

export interface IActionSearchSearcRequest extends Action {
    type: 'eslib/search/SEARCH_REQUEST'
    payload: {
        query: any
        size?: number
        position?: number
        add?: boolean
    }
}

export interface IActionSearchSearchSuccess extends Action {
    type: 'eslib/search/SEARCH_SUCCESS'
    payload: {
        total: number
        rows: Document[]
    }
}

export interface IActionSearchSearchSuccessAdditional extends Action {
    type: 'eslib/search/SEARCH_SUCCESS_ADD'
    payload: {
        total: number
        rows: Document[]
    }
}

export interface IActionSearchSearchFailure extends Action {
    type: 'eslib/search/SEARCH_FAILURE'
    payload: any[]
}

export interface IActionSearchSubjectListRequest extends Action {
    type: 'eslib/search/SUBJECT_LIST_REQUEST'
}

export interface IActionSearchSubjectListSuccess extends Action {
    type: 'eslib/search/SUBJECT_LIST_SUCCESS'
    payload: any[]
}

export interface IActionSearchSubjectListFailure extends Action {
    type: 'eslib/search/SUBJECT_LIST_FAILURE'
    payload: any[]
}

export interface IActionSearchFetchRequest extends Action {
    type: 'eslib/search/FETCH_DOCUMENT_REQUEST'
    payload: GetParams
}

export interface IActionSearchFetchSuccess extends Action {
    type: 'eslib/search/FETCH_DOCUMENT_SUCCESS'
    payload: Document
}

export interface IActionSearchFetchFailure extends Action {
    type: 'eslib/search/FETCH_DOCUMENT_FAILURE'
    payload: any[]
}

export interface IActionSearchDeleteRequest extends Action {
    type: 'eslib/search/DELETE_DOCUMENT_REQUEST'
    payload: DeleteDocumentParams
}

export interface IActionSearchDeleteSuccess extends Action {
    type: 'eslib/search/DELETE_DOCUMENT_SUCCESS'
    payload: string
}

export interface IActionSearchDeleteFailure extends Action {
    type: 'eslib/search/DELETE_DOCUMENT_FAILURE'
    payload: any[]
}

export type SearchActions = IActionSearchSearcRequest | IActionSearchSearchSuccess | IActionSearchSearchSuccessAdditional | IActionSearchSearchFailure | IActionSearchSubjectListRequest | IActionSearchSubjectListSuccess | IActionSearchSubjectListFailure | IActionSearchFetchRequest | IActionSearchFetchSuccess | IActionSearchFetchFailure | IActionSearchDeleteRequest | IActionSearchDeleteSuccess | IActionSearchDeleteFailure

