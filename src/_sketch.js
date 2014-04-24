// v2: enhance!

// keen2.json
schema: {
  root: 'result',
  each: {
    index: 'timeframe -> start',
    values: 'value -> result',
    labels: 'value -> parsed_user_agent.os.family'
  }
}

// git-traffic-data.json
schema: {
  root: 'counts',
  each: {
    index: 'bucket',
    values: 'total'
  }
}

// twitter.json
schema: {
  root: '',
  each: {
    index: {
      target: 'created_at',
      type: 'date',
      format: 'MMM DD',
      method: 'Twitter.DateFixer'
    },
    values: {
      target: 'text',
      type: 'string'
    },
    labels: {
      target: 'user -> screen_name',
      type: 'string',
      prefix: '@'
    }
  }
}

// keen extraction
schema: {
  root: 'result',
  each: {
    index: 'keen -> timestamp',
    values: [
      {
        target: 'visitor -> tech -> browser',
        label: 'Browser',
        type: 'string'
      }
    ]
  },
  sort: {
    index: 'asc'
  }
}


// "index" is processed into a single first cell per row (0,0 cell given)
// "values" is processed into a complete row with one cell per value
// "labels" is processed into a complete header with one cell per label



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
  root: 'result',
  each: {

    index: {
      target: 'timeframe -> start',
      type: 'date',
      format: 'MMM-DD' // moment.js
    },

    // values: {}, // single object, will expand

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
