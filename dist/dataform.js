// Source: src/dataform.js
/*!
  * ----------------
  * Dataform.js
  * ----------------
  */

function Dataform(raw, schema) {
  this.configure(raw, schema);
}

Dataform.prototype.configure = function(raw, schema){
  var self = this, options;

  self.raw = self.raw || raw;
  self.schema = self.schema || schema || {};

  self.table = [];

  if (self.schema.collection && is(self.schema.collection, 'string') == false) {
    throw new Error('schema.collection must be a string');
  }

  if (self.schema.select && self.schema.reduce) {
    throw new Error('schema.select and schema.reduce cannot be used together');
  }

  if (self.schema.select) {
    this.action = 'select';
    options = extend({
      collection: "",
      select: {
        index: false,
        value: false,
        label: false
      },
      sort: {
        index: 'asc',
        value: 'desc'
      }
    }, self.schema);
    options = _optHash(options);
    _selection.call(this, options);
  }

  if (self.schema.reduce) {
    this.action = 'reduce';
    options = extend({
      collection: "",
      reduce: true
    }, self.schema);
    options = _optHash(options);
    _reduction.call(this, options);
  }

  return this;
};

Dataform.prototype.sort = function(opts){
  var self = this, options;

  if (self.action == 'select') {

    options = extend({
      index: false,
      value: false
    }, opts);

    if (options.index) {
      !function(){
        var header = self.table[0];
        var body = self.table.splice(1);
        body.sort(function(a, b) {
          if (options.index == 'asc') {
            if (a[0] > b[0]) {
              return 1;
            } else {
              return -1
            }
          } else {
            if (a[0] > b[0]) {
              return -1;
            } else {
              return 1
            }
          }
          return false;
        });
        self.table = [header].concat(body);
      }();
    }

    if (options.value && self.schema.select.label && self.table[0].length > 2) {
      !function(){
        var series = [];
        each(self.table[0], function(column, i){
          if (i > 0) {
            series.push({ label: column, values: [], total: 0 });
          }
        });
        each(self.table, function(row, i){
          if (i > 0) {
            each(row, function(cell, j){
              if (j > 0) {
                if (is(cell, 'number')) {
                  console.log('cell is a number!');
                }
                series[j-1].values.push(cell);
              }
            });
          }
        });
        console.log(series, self.table);
      }();
    }
  }


  /////////////////

  if (self.action == 'reduce') {
    options = extend({
      0: 'asc',
      value: 'desc'
    }, opts);
    console.log(options);
  }

  return self;
};

// Convert string targets to
// a hash w/ matching target
// --------------------------
function _optHash(options){
  each(options.select, function(value, key, object){
    if (value && is(value, 'string')) {
      options.select[key] = { target: options.select[key] };
    }
  });
  return options;
}

function _reduction(options){
  console.log('Reduction', options);
  return this;
}


function _selection(options){
  // console.log('Selection', options);
  var self = this;

  var value_set = (options.select.value) ? options.select.value.target.split(" -> ") : false,
      label_set = (options.select.label) ? options.select.label.target.split(" -> ") : false,
      index_set = (options.select.index) ? options.select.index.target.split(" -> ") : false;

  var sort_index = (options.sort.index) ? options.sort.index : 'asc',
      sort_value = (options.sort.index) ? options.sort.index : 'desc';

  // Prepare root for parsing
  var root = (function(){
    var root;
    if (options.collection == "") {
      root = [self.raw];
    } else {
      root = parse.apply(self, [self.raw].concat(options.collection.split(" -> ")));
    }
    return root[0];
  })();

  // Sort records by index
  /*if (root instanceof Array) {
    root.sort(function(a, b){
      var sort_a_by, sort_b_by, sort_set, sort_dir;

      // Configure sort options
      if (index_set) {
        sort_set = index_set;
        sort_dir = options.sort.index;
      } else if (label_set) {
        sort_set = label_set;
        sort_dir = options.sort.label;
      }

      // Retrieve target properties
      sort_a_by = parse.apply(self, [a].concat(sort_set));
      sort_b_by = parse.apply(self, [b].concat(sort_set));

      // Return sort order
      if (sort_dir == 'asc') {
        if (sort_a_by > sort_b_by) {
          return 1;
        } else {
          return -1
        }
      } else {
        if (sort_a_by > sort_b_by) {
          return -1;
        } else {
          return 1
        }
      }
      return false;
    });
  }*/


  // Inject header row
  self.table.push([]);

  // Inject data rows
  each(root, function(){
    self.table.push([]);
  });


  // Parse each record
  each(root, function(record, interval){

    var plucked_value = (value_set) ? parse.apply(self, [record].concat(value_set)) : false,
        plucked_label = (label_set) ? parse.apply(self, [record].concat(label_set)) : false,
        plucked_index = (index_set) ? parse.apply(self, [record].concat(index_set)) : false;
    //console.log(plucked_value, plucked_label, plucked_index);

    // Build index column
    if (plucked_index) {

      // Build index/label on first interval
      if (interval == 0) {

        // Push last index property to 0,0
        self.table[0].push(index_set[index_set.length-1]);

        // Build subsequent series headers (1:N)
        if (plucked_label) {
          each(plucked_label, function(value, i){
            self.table[0].push(value);
          });
        } else {
          self.table[0].push(value_set[value_set.length-1]);
        }
      }

      self.table[interval+1].push(plucked_index[0]);
    }

    // Build label column
    if (!plucked_index && plucked_label) {
      if (interval == 0) {
        self.table[0].push(label_set[label_set.length-1]);
        self.table[0].push(value_set[value_set.length-1]);
      }
      self.table[interval+1].push(plucked_label[0]);
    }

    if (!plucked_index && !plucked_label) {
      // [REVISIT]
      self.table[0].push('');
    }


    // Append values
    if (plucked_value) {
      each(plucked_value, function(value, i){
        self.table[interval+1].push(value);
      });
    }

  });

  self.sort(options.sort);

  return this;

  // ------------------------------
  // ------------------------------
  // ------------------------------

  //self.map = this.schema;
  //self.table = [],
  //self.series = [],
  //self.raw = data;

  /*
  self.cols = (function(){
    var split_index, split_value, output = { fixed: [] };

    split_value = self.schema.select.value.target.split(" -> ");
    split_index = (self.schema.select.index.target) ? self.schema.select.index.target.split(" -> ") : self.schema.select.value.target.split(" -> ");
    output.fixed.push(split_index[split_index.length-1]);

    if (self.schema.select.label.target) {
      output.cells = self.schema.select.label.target.split(" -> ");
    } else {
      output.fixed.push(split_value[split_value.length-1])
    }
    return output;

  })();


  self.rows = {
    index: (self.schema.select.index.target) ? self.schema.select.index.target.split(" -> ") : ['result'],
    cells: (self.schema.select.value.target) ? self.schema.select.value.target.split(" -> ") : []
  };

  self.order = (function(){
    var output = {};
    if (self.schema.sort) {
      output.rows = self.schema.sort.index || 'asc';
      output.cols = self.schema.sort.label || 'desc';
    }
    return output;
  })();

  // SORT ROWS
  if (self.order.rows.length > 0) {
    if (self.root instanceof Array) {
      self.root.sort(function(a, b){
        var aIndex = parse.apply(self, [a].concat(self.rows.index));
        var bIndex = parse.apply(self, [b].concat(self.rows.index));

        if (self.order.rows == 'asc') {
          if (aIndex > bIndex){return 1;}
          if (aIndex < bIndex){return -1;}
          return 0;
        } else {
          if (aIndex > bIndex){return -1;}
          if (aIndex < bIndex){return 1;}
          return 0;
        }

        return false;
      });
    }
  }

  // ADD SERIES
  (function(){
    //var fixed, cells, output;
    //self.cols.label = (self.cols.fixed.length > 0) ? self.cols.fixed[0] : 'series';
    if (self.cols.fixed && self.cols.fixed[self.cols.fixed.length-1] == "") {
      self.cols.label = self.cols.fixed[self.cols.fixed.length-1];
      fixed = self.cols.fixed;
      fixed.splice((fixed.length-1),1);
    } else {
      self.cols.label = fixed = self.cols.fixed[0];
      fixed = self.cols.fixed;
    }

    //var fixed = (self.cols.fixed) ? self.cols.fixed : [];
    var cells = (self.cols.cells) ? parse.apply(self, [self.root[0]].concat(self.cols.cells)) : [];
    var output = fixed.concat(cells);
    if (output.length > 1) {
      output.splice(0,1);
    }
    each(output, function(el, i){
      self.series.push({ key: el, values: [] });
    });
  })();

  // ADD SERIES' RECORDS
  if (self.root instanceof Array || typeof self.root == 'object') {
    each(self.root, function(el){
      var index = parse.apply(self, [el].concat(self.rows.index));
      var cells = parse.apply(self, [el].concat(self.rows.cells));
      //console.log(index, cells);
      if (index.length > 1) {
        each(index, function(key, j){
          var output = {};
          output[self.cols.label] = key;
          output.value = cells[j];
          self.series[0].values.push(output);
        });
      } else {
        each(cells, function(cell, j){
          var output = {};
          output[self.cols.label] = index[0];
          output.value = cell;
          self.series[j].values.push(output);
        });
      }
    });
  } else {
    (function(){
      var output = {};
      output[self.cols.label] = 'result';
      output.value = self.root;
      self.series[0].values.push(output);
    })();
  }


  // SORT COLUMNS
  if (self.order.cols.length > 0) {
    self.series = self.series.sort(function(a, b){
      var aTotal = 0;
      var bTotal = 0;
      each(a.values, function(record){
        aTotal += record.value;
      });
      each(b.values, function(record){
        bTotal += record.value;
      });

      if (self.order.cols == 'asc') {
        return aTotal - bTotal;
      } else {
        return bTotal - aTotal;
      }
    });
  }

  // BUILD TABLE
  //self.table = [];

  //console.log(self.cols.fixed, self.cols.index);
  //if (self.cols.index) {
    self.table.push([self.cols.label]);
    each(self.series[0].values, function(value){
      self.table.push([value[self.cols.label]]);
    });
  /*} else {
    self.table.push([]);
    each(self.series[0].values, function(value){
      self.table.push([]);
    });
  }*/

  /*each(self.series, function(series){
    self.table[0].push(series.key);
    each(series.values, function(record, j){
      self.table[j+1].push(record.value);
    });
  });*/

  // COLUMN TRANSFORMS
  /*
  if (setup.cols.transform) {
    for (var transform in setup.cols.transform) {
      if (transform == 'all') {
        each(self.table[0], function(column, index){
          if (index > 0) {
            self.table[0][index] = setup.cols.transform[transform](self.table[0][index]);
          }
        });
      } else {
        transform = parseInt(transform);
        if (self.table[0].length > transform) {
          self.table[0][transform] = setup.cols.transform[transform](self.table[0][transform]);
        }
      }
    }
  }*/

  // ROW TRANSFORMS
  /*
  if (setup.rows.transform) {
    each(self.table, function(row, index){
      if (index > 0) {
        for (var transform in setup.rows.transform) {
          self.table[index][transform] = setup.rows.transform[transform](self.table[index][transform]);
        }
      }
    });
  }*/

  //return this;
}


Dataform.prototype.build = function(data, schema) {
  var self = this, map = schema;

  self.raw = data,
  self.schema = schema;

  // Build options hash
  var options = extend({
    root: "",
    each: {
      index: false,
      values: false,
      labels: false
    }
  }, self.schema);

  // Prepare root for parsing
  var root = self.root = (function(){
    var root;
    if (options.root == "") {
      root = [[self.raw]];
    } else {
      root = parse.apply(self, [self.raw].concat(options.root.split(" -> ")));
    }
    return root[0];
  })();

  /*
  each(root, function(){
    // Prefill data structures
    test.table.push([]);
    // test.series.push({ label: undefined, values: [] });
  });

  // Retrieve indices
  if (options.select && options.select.index) {
    (function(){
      var index_trail = options.select.index.target.split(" -> ");
      var indices = parse.apply(self, [root].concat(index_trail));
      test.table[0].push(index_trail[index_trail.length-1]);
      each(indices, function(index, i){
        test.table[i+1].push(index);
        // test.series[i].values.push({ index: index, value: undefined });
      });
      console.log(index_trail, indices);
    })();
  }

  // Retrieve labels
  if (options.select && options.select.label) {
    // Dynamic
    (function(){
      var label_trail = options.select.label.target.split(" -> ");
      var labels = parse.apply(self, [root].concat(label_trail));
      each(labels, function(label, i){
        test.table[0].push(label);
      });
      console.log(label_trail, labels);
    })();
  } else {
    // Static
    (function(){
      var value_key = (options.select) ? options.select.value.target.split(" -> ") : [];
      var label = value_key[value_key.length-1];
      test.table[0].push(label);
    })();
  }*/

  // ------------------------------
  // ------------------------------
  // ------------------------------

  self.map = map,
  self.table = [],
  self.series = [],
  //self.raw = data;

  self.cols = (function(){
    var split_index, split_value, output = { fixed: [] };

    split_value = self.map.each.value.split(" -> ");
    split_index =  (self.map.each.index) ? self.map.each.index.split(" -> ") : self.map.each.value.split(" -> ");
    output.fixed.push(split_index[split_index.length-1]);

    if (self.map.each.label) {
      output.cells = self.map.each.label.split(" -> ");
    } else {
      output.fixed.push(split_value[split_value.length-1])
    }
    return output;

  })();


  self.rows = {
    index: (self.map.each.index) ? self.map.each.index.split(" -> ") : ['result'],
    cells: (self.map.each.value) ? self.map.each.value.split(" -> ") : []
  };

  self.order = (function(){
    var output = {};
    if (self.map.sort) {
      output.rows = self.map.sort.index || 'asc';
      output.cols = self.map.sort.label || 'desc';
    }
    return output;
  })();

  // SORT ROWS
  if (self.order.rows.length > 0) {
    if (self.root instanceof Array) {
      self.root.sort(function(a, b){
        var aIndex = parse.apply(self, [a].concat(self.rows.index));
        var bIndex = parse.apply(self, [b].concat(self.rows.index));

        if (self.order.rows == 'asc') {
          if (aIndex > bIndex){return 1;}
          if (aIndex < bIndex){return -1;}
          return 0;
        } else {
          if (aIndex > bIndex){return -1;}
          if (aIndex < bIndex){return 1;}
          return 0;
        }

        return false;
      });
    }
  }

  // ADD SERIES
  (function(){
    //var fixed, cells, output;
    //self.cols.label = (self.cols.fixed.length > 0) ? self.cols.fixed[0] : 'series';
    if (self.cols.fixed && self.cols.fixed[self.cols.fixed.length-1] == "") {
      self.cols.label = self.cols.fixed[self.cols.fixed.length-1];
      fixed = self.cols.fixed;
      fixed.splice((fixed.length-1),1);
    } else {
      self.cols.label = fixed = self.cols.fixed[0];
      fixed = self.cols.fixed;
    }

    //var fixed = (self.cols.fixed) ? self.cols.fixed : [];
    var cells = (self.cols.cells) ? parse.apply(self, [self.root[0]].concat(self.cols.cells)) : [];
    var output = fixed.concat(cells);
    if (output.length > 1) {
      output.splice(0,1);
    }
    each(output, function(el, i){
      self.series.push({ key: el, values: [] });
    });
  })();

  // ADD SERIES' RECORDS
  if (self.root instanceof Array || typeof self.root == 'object') {
    each(self.root, function(el){
      var index = parse.apply(self, [el].concat(self.rows.index));
      var cells = parse.apply(self, [el].concat(self.rows.cells));
      //console.log(index, cells);
      if (index.length > 1) {
        each(index, function(key, j){
          var output = {};
          output[self.cols.label] = key;
          output.value = cells[j];
          self.series[0].values.push(output);
        });
      } else {
        each(cells, function(cell, j){
          var output = {};
          output[self.cols.label] = index[0];
          output.value = cell;
          self.series[j].values.push(output);
        });
      }
    });
  } else {
    (function(){
      var output = {};
      output[self.cols.label] = 'result';
      output.value = self.root;
      self.series[0].values.push(output);
    })();
  }


  // SORT COLUMNS
  if (self.order.cols.length > 0) {
    self.series = self.series.sort(function(a, b){
      var aTotal = 0;
      var bTotal = 0;
      each(a.values, function(record){
        aTotal += record.value;
      });
      each(b.values, function(record){
        bTotal += record.value;
      });

      if (self.order.cols == 'asc') {
        return aTotal - bTotal;
      } else {
        return bTotal - aTotal;
      }
    });
  }

  // BUILD TABLE
  self.table = [];

  //console.log(self.cols.fixed, self.cols.index);
  //if (self.cols.index) {
    self.table.push([self.cols.label]);
    each(self.series[0].values, function(value){
      self.table.push([value[self.cols.label]]);
    });
  /*} else {
    self.table.push([]);
    each(self.series[0].values, function(value){
      self.table.push([]);
    });
  }*/

  each(self.series, function(series){
    self.table[0].push(series.key);
    each(series.values, function(record, j){
      self.table[j+1].push(record.value);
    });
  });

  // COLUMN TRANSFORMS
  /*
  if (setup.cols.transform) {
    for (var transform in setup.cols.transform) {
      if (transform == 'all') {
        each(self.table[0], function(column, index){
          if (index > 0) {
            self.table[0][index] = setup.cols.transform[transform](self.table[0][index]);
          }
        });
      } else {
        transform = parseInt(transform);
        if (self.table[0].length > transform) {
          self.table[0][transform] = setup.cols.transform[transform](self.table[0][transform]);
        }
      }
    }
  }*/

  // ROW TRANSFORMS
  /*
  if (setup.rows.transform) {
    each(self.table, function(row, index){
      if (index > 0) {
        for (var transform in setup.rows.transform) {
          self.table[index][transform] = setup.rows.transform[transform](self.table[index][transform]);
        }
      }
    });
  }*/

  return this;
};

function parse() {
  var result = [];
  var loop = function() {
    var root = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1);
    var target = args.pop();

    if (args.length === 0) {
      if (root instanceof Array) {
        args = root;
      } else if (typeof root === 'object') {
        args.push(root);
      }
    }

    each(args, function(el){


      if (target == "" && typeof el == "number") {
        //console.log(typeof(el), el);
        return result.push(el);
      }
      //

      if (el[target] || el[target] === 0 || el[target] !== void 0) {
        // Easy grab!
        if (el[target] === null) {
          return result.push('');
        } else {
          return result.push(el[target]);
        }

      } else if (root[el]){
        if (root[el] instanceof Array) {
          // dive through each array item

          each(root[el], function(n, i) {
            var splinter = [root[el]].concat(root[el][i]).concat(args.slice(1)).concat(target);
            return loop.apply(this, splinter);
          });

        } else {
          if (root[el][target]) {
            // grab it!
            return result.push(root[el][target]);

          } else {
            // dive down a level!
            return loop.apply(this, [root[el]].concat(args.splice(1)).concat(target));

          }
        }

      } else {
        // dive down a level!
        return loop.apply(this, [el].concat(args.splice(1)).concat(target));

      }

      return;

    });
    if (result.length > 0) {
      return result;
    }
  };
  return loop.apply(this, arguments);
}

// via: https://github.com/spocke/punymce
function is(o, t){
  o = typeof(o);
  if (!t){
    return o != 'undefined';
  }
  return o == t;
}

function each(o, cb, s){
  var n;
  if (!o){
    return 0;
  }
  s = !s ? o : s;
  if (is(o.length)){
    // Indexed arrays, needed for Safari
    for (n=0; n<o.length; n++) {
      if (cb.call(s, o[n], n, o) === false){
        return 0;
      }
    }
  } else {
    // Hashtables
    for (n in o){
      if (o.hasOwnProperty(n)) {
        if (cb.call(s, o[n], n, o) === false){
          return 0;
        }
      }
    }
  }
  return 1;
}

// Adapter to exclude null values
function extend(o, e){
  each(e, function(v, n){
    if (is(o[n], 'object') && is(v, 'object')){
      o[n] = extend(o[n], v);
    } else if (v !== null) {
      o[n] = v;
    }
  });
  return o;
}

// Source: src/lib/average.js
Dataform.prototype.average = function(){
  return [5];
};

// Source: src/lib/count.js
Dataform.prototype.count = function(){
  return [10];
};

// Source: src/lib/maximum.js
Dataform.prototype.maximum = function(){
  //if (this.table) {}
  // return Math.max for index/all
  // return [1,2,3,4,5];
  return [9];
};

// Source: src/lib/median.js
Dataform.prototype.median = function(){
  return [4.3];
};

// Source: src/lib/minimum.js
Dataform.prototype.minimum = function(){
  //if (this.table) {}
  // return Math.min for index/all
  // return [1,2,3,4,5];
  return [0];
};

// Source: src/lib/mode.js
Dataform.prototype.mode = function(){
  return [3];
};

// Source: src/lib/sum.js
Dataform.prototype.sum = function(){
  return [23];
};
