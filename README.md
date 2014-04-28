Dataform.js
==========


### Configuration

An optional `collection` property identifies where to begin processing records.

```
var data = new Dataform(response_json, {
  collection: "results"
  // config covered below…
});
```

There are two methods for processing incoming data: `select` and `unpack`.


## Method 1: "select" properties from each record

`Select` accepts an array of configuration hashes to filter against each record in the source data. The resulting 2D array will contain a row for each record, and a cell for each targeted property.


```
var data = new Dataform(response_json, {
  collection: "results",
  select: [
  	{
  	  path: "dives through ugly -> nested.keys -> target",
  	  type: "date",
  	  format: "MMM DD, YYYY"
  	},
  	{
  	  path: "to.reach -> target.values",
  	  type: "number",
  	  format: "1,000.00",
  	  prefix: "$",
  	  suffix: "/mo"
  	},
  	{
  	  path: "another.property -> burrrried -> down_here",
  	  type: "string",
  	  format: "capitalize",
  	  prefix: "@"
  	}
  ],
  sort: {
  	column: 0,
  	order: "asc"
  }
})
```

#### Sample output

```
[
  [ 'target',       'target.values',  'down_here'  ],
  [ 'Apr 24, 2014', '$4,321.35/mo',   '@Home'      ],
  [ 'Apr 26, 2014', '$321.50/mo',     '@Somewhere' ],
  [ 'Apr 27, 2014', '$167.23/mo',     '@Another'   ],
]
```


## Method 2: "unpack" properties from each record

`Unpack` uses a dictionary of keys to map various aspects of the data: 

* `value`: (required), the specific property that you want to extract
* `index`: a property that describes how the data is organized, such as a date or interval
* `label`: a property that describes where the value belongs, such as a series or group name

```
var data = new Dataform(response_json, {
  collection: "results",
  unpack: {
    index: "dives through ugly -> nested.keys -> target",
    value: "to.reach -> target.values",
    label: "grouped_by -> label"
  },
  sort: {
    index: "asc",
    value: "desc"
  }
})
```

"Unpacked" data can be sorted by index or value. In the latter case, columns are arranged by the sum of their respective values.


## Formatting

Configuration hashes also accept several handy formatting attributes for modifying each property. Just be sure to include a `type` attribute on each hash, so the library knows what it's working with.

* `prefix`: text prepended to the retrieved value (ex: "$")
* `suffix`: text appended to the retrieved value (ex: " per month")

**Number formatting**

* `format`: sample string exhibiting presence of commas and number of decimal places to display (ex: "1,000.0000000" vs. "1000.0")

**Date formatting**

* `format`: currently handled with [moment.js](http://momentjs.com/docs/) when installed (ex: "MMM DD, YYY"). There is also a `method` attribute (described below) which opens more possibilities for formatting.

**String formatting**

* `format`: accepts "uppercase", "lowercase", or "capitalize"
* `replace`: a dictionary that specifies replacement *values* for matching *keys* (ex: below)

```
replace: {
  "original property text": "Replaced Text"
}
```

**Experimental** .. because, *who knows?!* :)

* `method`: custom method name which is eval'd, executed and returns a custom value

```
method: "MyCustomMethods.handleDates"
```
```
MyCustomMethods = {
  handleDates: function(value, config){
    var date = new Date(parsed);
    return date.getUTCMonth() + "/" + date.getUTCFullYear();
  }
}
```



## Output

The result of this quick configuration is a standard 2D array representation of the source data; sorted, formatted, and ready to rock.

`dataform.table`

```
[
  ['index_key', 'label_1', 'label_2'],
  ['index_val', 'value_1', 'value_2'],
  ['index_val', 'value_1', 'value_2'],
  ['index_val', 'value_1', 'value_2'],
]
```
