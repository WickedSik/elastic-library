import * as ActionTypes from '../ActionTypes';
import Config from '../../../config'

export const search = (query, size, position, add) => ({
    type: ActionTypes.SEARCH_REQUEST,
    payload: {
        query,
        size,
        position,
        add
    }
})

export const subjectList = () => ({
    type: ActionTypes.SUBJECT_LIST_REQUEST,
    payload: {
        index: Config.search.index,
        type: Config.search.type,
        body: {
            size: 0,
            aggs: {
                keywords: {
                    terms: { 
                        field: "keywords.keyword",
                        order: { "_count": "desc" },
                        size: 10000
                    }
                }
            }
        }
    }
})

export const fetch = (id) => ({
    type: ActionTypes.FETCH_DOCUMENT_REQUEST,
    payload: {
        index: Config.search.index,
        type: Config.search.type,
        id
    }
})