# To Do

- [ ] Slideshow
- [x] Toggle for details or big image (for use in media dialog)
      This does probably mean I need to connect the media dialog to the store, as it's a global setting
      This works with a "local" store too, given that everything is focussed on one state (`<App />`'s state)
- [ ] Use `react-d3` for charts, fed by `elasticsearch`
- [ ] Discard selection when changing tags for media that is no longer in the result-set
- [ ] Fix the below error:  
      ```
      Warning: Can't call setState (or forceUpdate) on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.
      in MediaItem (at index.js:45)
      ```

## Bulk actions

- [ ] ?

# Food for thought

> Late night rambling

-   Is it right to have a state for the current active card, or should it be part of the store?
    It's probably easier even to move forward and backwards then, but the results should also be in there (I think they are)

# Bulk Update

```json
{
  "query": {
    "term": {
      "keywords.keyword": "Lola"
    }
  },
  "script": {
    "source": "ctx._source.keywords.add(params.newKeyword); ctx._source.keywords.remove(ctx._source.keywords.indexOf(params.oldKeyword))",
    "params": {
      "oldKeyword": "Lola",
      "newKeyword": "character:Lola"
    },
    "lang": "painless"
  }
}
```