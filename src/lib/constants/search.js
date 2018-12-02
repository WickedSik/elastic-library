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
