import * as ActionTypes from '../ActionTypes';

export const search = (query) => ({
    type: ActionTypes.SEARCH_REQUEST,
    payload: {
        ...query
    }
})

export const subjectList = () => ({
    type: ActionTypes.SUBJECT_LIST_REQUEST,
    payload: {
        index: 'media',
        type: 'media',
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