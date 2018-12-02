import { dispatchAction } from '../index'
import config from '../../../constants/search'
import {
    SEARCH_REQUEST,
    SUBJECT_LIST_REQUEST,
    FETCH_DOCUMENT_REQUEST,
    DELETE_DOCUMENT_REQUEST
} from './actiontypes'

const SUBJECT_LIST_QUERY = {
    index: config.index,
    type: config.type,
    body: {
        size: 0,
        aggs: {
            keywords: {
                terms: {
                    field: 'keywords',
                    order: { '_count': 'desc' },
                    size: 10000
                }
            }
        }
    }
}

export const search = (query, size, position, add) => dispatchAction(SEARCH_REQUEST, { query, size, position, add })
export const subjectList = () => dispatchAction(SUBJECT_LIST_REQUEST, SUBJECT_LIST_QUERY)
export const fetch = (id) => dispatchAction(FETCH_DOCUMENT_REQUEST, { index: config.index, type: config.type, id })
export const deleteDocument = (id) => dispatchAction(DELETE_DOCUMENT_REQUEST, { index: config.index, type: config.type, id })
