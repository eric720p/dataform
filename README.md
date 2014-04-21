Dataform.js
==========


### Configure

```
var dataform = new Dataform(response_json, {
  root: "results",
  each: {
    index: "dives through ugly -> nested.keys -> target",
    value: "to.reach -> target.values",
    label: "grouped_by -> label"
  }
})
```

### Output

`dataform.table`

```
[
  ['index_key', 'label_1', 'label_2'],
  ['index_val', 'value_1', 'value_2'],
  ['index_val', 'value_1', 'value_2'],
  ['index_val', 'value_1', 'value_2'],
]
```
