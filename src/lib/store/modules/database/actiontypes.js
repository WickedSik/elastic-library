import { action } from '../index'

export const GET_DOCUMENT_REQUEST = action('database', 'GET_DOCUMENT_REQUEST')
export const GET_DOCUMENT_SUCCESS = action('database', 'GET_DOCUMENT_SUCCESS')
export const GET_DOCUMENT_FAILURE = action('database', 'GET_DOCUMENT_FAILURE')

export const LOAD_DOCUMENTS_REQUEST = action('database', 'LOAD_DOCUMENTS_REQUEST')
export const LOAD_DOCUMENTS_SUCCESS = action('database', 'LOAD_DOCUMENTS_SUCCESS')
export const LOAD_DOCUMENTS_FAILURE = action('database', 'LOAD_DOCUMENTS_FAILURE')
