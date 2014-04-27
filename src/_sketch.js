// v2: enhance!
// ------------------

// explicit structure
// - one row per collection item
// - one row cell per config {object}
// - one header cell per config.label
reduce: [
  {},{},{}
],
sort: {
  2: 'asc'
}

// implicit structure
// - one row per index (first cell)
// - one row cell per value
// - one header cell per label
select: {
  index: {},
  value: {},
  label: {}
},
sort: {
  index: 'asc',
  value: 'desc'
}

// ------------------

// keen2.json
schema: {
  collection: 'result',
  select: {
    index: 'timeframe -> start',
    value: 'value -> result',
    label: 'value -> parsed_user_agent.os.family'
  }
}

// git-traffic-data.json
schema: {
  collection: 'counts',
  select: {
    index: 'bucket',
    value: 'total'
  }
}

// twitter.json
schema: {
  collection: '',
  select: {
    index: {
      target: 'created_at',
      type: 'date',
      format: 'MMM DD',
      method: 'Twitter.DateFixer'
    },
    value: {
      target: 'text',
      type: 'string'
    },
    label: {
      target: 'user -> screen_name',
      type: 'string',
      prefix: '@'
    }
  },
  sort: {
    index: 'asc',
    value: 'desc'
  }
}

// keen extraction
schema: {
  collection: 'result',
  reduce: [
    {
      target: 'keen -> timestamp',
      type: 'date',
      label: 'Time',
      format: 'MMM DD, YYYY'
    },
    {
      target: 'visitor -> tech -> browser',
      type: 'string',
      label: 'Browser'
    },
    {
      target: 'visitor -> geo -> country',
      type: 'string',
      label: 'Origin'
    }
  ],
  sort: {
    index: 'asc'
  }
}

// "index" is processed into a single first cell per row (0,0 cell given)
// "value" is processed into a complete row with one cell per value
// "label" is processed into a complete header with one cell per label



// ------------------
// valueS !== value_
// labelS !== label_
// ------------------
// "value" is processed into a complete row with one cell per record
// "values" is processed into a complete row with N cells per record
// ------------------

schema: {
  root: 'result',
  each: {

    index: {
      target: 'timeframe -> start',
      type: 'date',
      format: 'MMM-DD' // moment.js
    },

    // values: {}, // single object, will expand ?
    values: [ // array, will declare column for each
      {
        target: 'value -> user -> username',
        label: 'Username',
        type: 'string',
        prefix: '@',
        suffix: 'bro'
      },
      {
        target: 'value -> activity -> purchases',
        label: 'Total Purchases',
        type: 'number',
        format: '1,000.00',
        prefix: '$',
        suffix: '/mo',
        modifier: '*100'
      },
      {
        target: 'value -> user -> dob',
        label: 'Birthday'
        type: 'date',
        format: 'MMM DD, YYYY'
      }
    ]
  },
  sort: {
    index: 'asc', // sort numerically by dates
    values: 'desc' // sort alphabetically by label
  }
}







































schema: {
  root: 'result',
  each: {
    index: 'key -> key -> date',
    value: 'key -> key -> value',
    label: 'key -> label'
  },
  format: {
    index: { type: 'date', sort: 'asc', format: 'MMM D' },
    label: { type: 'string', sort: 'desc', prefix: '@' },
    value: { type: 'number', prefix: '$', modifier: '*100' }
  }
}

// or maybe...?
schema: {
  root: 'result',

  // is "each" necessary?

  //index: { type: 'date', sort: 'desc', format: 'MMM D' },
  //index: { type: 'string', sort: 'asc', format: 'capitalize' }, // lowercase, uppercase

  index: {
    target: 'timeframe -> start',
    type: 'date',
    sort: 'asc',
    prefix: '$',
    suffix: '!',
    modifier: '*1000'
  },

  value: {
    target: 'value -> result',
    type: 'number',
    sort: 'desc',
    format: '1,000.00', // decimal length, commas
    prefix: '$',
    modifier: '* 100'
  },

  label: {
    target: 'value -> unique_groupBy_field',
    type: 'string',
    replace: {
      'http://mysite.com/': 'Home page'
    },
    method: 'Keen.vis.labelMapper'
  }
}




// Array for multiple
// ---------------------------
schema: {
  root: 'result',
  each: {
    index: 'key -> key -> date',
    value: [
      'key -> key -> value1',
      'key -> key -> value2',
      'key -> key -> value3'
    ]
  },
  sort: {

  }
}

// && symbol for multiple
// ---------------------------
schema: {
  root: 'result',
  each: {
    index: 'key -> key -> signup_date',
    value: 'key -> key -> username && purchases && dob'
  },
  format: {
    index: {
      type: 'date',
      sort: 'asc',
      format: 'MMM-DD'
    },
    value: [
      {
        type: 'string',
        prefix: '@'
      },
      {
        type: 'number',
        prefix: '$',
        format: '1,000.00'
      }
    ]
  },
  sort: {
    index: 'asc',
    values: 'total:desc'
  }
}



// ------------------
// valueS !== value_
// labelS !== label_
// ------------------
// "value" is processed into a complete row with one cell per record
// "values" is processed into a complete row with N cells per record
// ------------------

schema: {
  collection: 'result',

  // pick
  // trim
  // pluck

  // explicit
  // - one row per record
  reduce: [
    {},{},{} // each designates a label
  ],

  // implicit
  // - one row per index
  // - one cell per record
  select: {
    index: {},
    value: {},
    label: {}
  },

  each: {

    index: {
      target: 'timeframe -> start',
      type: 'date',
      format: 'MMM-DD' // moment.js
    },

    values: [
      {
        target: 'value -> user -> username',
        label: 'Username',
        type: 'string',
        prefix: '@',
        suffix: 'bro'
      },
      {
        target: 'value -> activity -> purchases',
        label: 'Total Purchases',
        type: 'number',
        format: '1,000.00',
        prefix: '$',
        suffix: '/mo',
        modifier: '*100'
      },
      {
        target: 'value -> user -> dob',
        label: 'Birthday'
        type: 'date',
        format: 'MMM DD, YYYY'
      }
    ]

    /* Array of static labels

    labels: [
      'Username',
      'Total Purchases',
      'Birthday'
    ]

    */
  },
  sort: {
    index: 'asc', // sort numerically by dates
    values: 'desc' // sort alphabetically by label
  }
}
