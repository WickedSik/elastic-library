# To Do

- [ ] Slideshow
- [ ] Toggle for details or big image (for use in media dialog)
      This does probably mean I need to connect the media dialog to the store, as it's a global setting

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