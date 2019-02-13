import { action } from '../index'

export const SEARCH_REQUEST = action('search', 'SEARCH_REQUEST')
export const SEARCH_FAILED = action('search', 'SEARCH_FAILED')
export const SEARCH_SUCCESS = action('search', 'SEARCH_SUCCESS')
export const SEARCH_SUCCESS_ADD = action('search', 'SEARCH_SUCCESS_ADD')

export const SUBJECT_LIST_REQUEST = action('search', 'SUBJECT_LIST_REQUEST')
export const SUBJECT_LIST_FAILED = action('search', 'SUBJECT_LIST_FAILED')
export const SUBJECT_LIST_SUCCESS = action('search', 'SUBJECT_LIST_SUCCESS')

export const FETCH_DOCUMENT_REQUEST = action('search', 'FETCH_DOCUMENT_REQUEST')
export const FETCH_DOCUMENT_FAILED = action('search', 'FETCH_DOCUMENT_FAILED')
export const FETCH_DOCUMENT_SUCCESS = action('search', 'FETCH_DOCUMENT_SUCCESS')

export const DELETE_DOCUMENT_REQUEST = action('search', 'DELETE_DOCUMENT_REQUEST')
export const DELETE_DOCUMENT_FAILED = action('search', 'DELETE_DOCUMENT_FAILED')
export const DELETE_DOCUMENT_SUCCESS = action('search', 'DELETE_DOCUMENT_SUCCESS')

export const CHECKED_ON_BOORU = 'checked_on_e621'
export const NOT_FOUND_ON_BOORU = 'not_found_on_e621'
