# To Do

- [ ] Slideshow
- [ ] Toggle for details or big image (for use in media dialog)
      This does probably mean I need to connect the media dialog to the store, as it's a global setting

# Food for thought

> Late night rambling

-   Is it right to have a state for the current active card, or should it be part of the store?
    It's probably easier even to move forward and backwards then, but the results should also be in there (I think they are)

# Structuring

> Do I even want this?

```json
{
      "_source": {},
      "tags": [
            {
                  "_id": "...",
                  "label" "Tag 1",
                  "path": "/common/general/tag1"
            },
            {
                  "_id": "...",
                  "label" "Tag 2",
                  "path": "/common/general/tag2"
            }
      ]
}
```