export default {
    index: 'media',
    type: 'media',
    size: 100,
    defaultSearch: '*',
    sortingOptions: {
        no: {'file.created_at': 'desc'},
        yes: {'_score': 'desc'}
    }
}

export const CHECKED_ON_BOORU = 'checked_on_booru'
