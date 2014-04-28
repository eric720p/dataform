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

  self.raw = self.raw || raw,
  self.schema = self.schema || schema || {},
  self.table = [[]];

  if (self.schema.collection && is(self.schema.collection, 'string') == false) {
    throw new Error('schema.collection must be a string');
  }

  if (self.schema.unpack && self.schema.select) {
    throw new Error('schema.unpack and schema.select cannot be used together');
  }

  if (self.schema.unpack) {
    this.action = 'unpack';
    options = extend({
      collection: "",
      unpack: {
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
    _unpack.call(this, options);
  }

  if (self.schema.select) {
    this.action = 'select';
    options = extend({
      collection: "",
      select: true
    }, self.schema);
    options = _optHash(options);
    _select.call(this, options);
  }

  return this;
};



// Select
// --------------------------------------

function _select(options){
  //console.log('Selecting', options);
  var self = this,
      target_set = [];

  var root = (function(){
    var root, parsed;
    if (options.collection == "") {
      root = self.raw;
    } else {
      parsed = parse.apply(self, [self.raw].concat(options.collection.split(" -> ")));
      root = parsed[0];
    }
    if (Object.prototype.toString.call(root) !== '[object Array]') {
      root = [root];
    }
    return root;
  })();

  each(options.select, function(property, i){
    target_set.push(property.target.split(" -> "));
  });

  // Parse each record
  each(root, function(record, interval){
    var property_set = [];
    each(target_set, function(target, i){
      var result = parse.apply(self, [record].concat(target));
      property_set.push(result[0]);
      if (interval == 0) {
        self.table[0].push(target[target.length-1]);
      }
    });
    each(property_set, function(row, i){
      self.table.push(property_set);
    });
  });

  self.format(options.select);
  self.sort(options.sort);
  return self;
}



// Unpack
// --------------------------------------

function _unpack(options){
  // console.log('Unpacking', options);
  var self = this;

  var value_set = (options.unpack.value) ? options.unpack.value.target.split(" -> ") : false,
      label_set = (options.unpack.label) ? options.unpack.label.target.split(" -> ") : false,
      index_set = (options.unpack.index) ? options.unpack.index.target.split(" -> ") : false;

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

  self.format(options.unpack);
  self.sort(options.sort);
  return this;
}



// String configs to hash targets
// --------------------------------------

function _optHash(options){
  each(options.unpack, function(value, key, object){
    if (value && is(value, 'string')) {
      options.unpack[key] = { target: options.unpack[key] };
    }
  });
  return options;
}



// ♫♩♬ Holy Diver! ♬♩♫
// --------------------------------------

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

      //console.log('here', (target == ""), el, root);
      if (target == "" && typeof el == "number") {
        //console.log('here', typeof(el), el);
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



// Utilities
// --------------------------------------

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


// Configure moment.js if present
!function(){
  if (moment) {
    moment.suppressDeprecationWarnings = true;
  }
}();

// Source: src/lib/format.js
Dataform.prototype.format = function(opts){
  var self = this, options;

    var defaults = {
      'number': {
        format: '1,000.00',
        prefix: '',
        suffix: '',
        modifier: '*1'
      },
      'date': {
        //format: 'MMM DD, YYYY'
      },
      'string': {
        //format: 'capitalize',
        prefix: '',
        suffix: ''
      }
    };

    if (self.action == 'select') {
      options = [];
      each(opts, function(option){
        var copy = {}, output;
        each(defaults, function(hash, key){
          copy[key] = extend({}, hash);
        });
        output = (copy[option.type]) ? extend(copy[option.type], option) : option;
        options.push(output);
      });

      each(self.table, function(row, i){

        // Replace labels
        if (i == 0) {
          each(row, function(cell, j){
            if (options[j].label) {
              self.table[i][j] = options[j].label;
            }
          });

        } else {

          each(row, function(cell, j){
            self.table[i][j] = _applyFormat(self.table[i][j], options[j]);
            //console.log(options[j].type);
          });
        }

      });

    }


  //////////////////////////////////
  if (self.action == 'unpack') {
    // console.log("1 unpack:format");
  }

  //console.log(self.table);
  return self;
};

function _applyFormat(value, opts){
  var output = value,
      options = opts || {};

  if (options.type && options.type == 'date') {

    if (options.format && moment && moment(value).isValid()) {
      output = moment(value).format(options.format);
    } else {
      output = new Date(value); //.toISOString();
    }

  }

  if (options.type && options.type == 'string') {
    if (options.format) {
      switch (options.format) {
        case 'capitalize':
          // via: http://stackoverflow.com/a/15150510/2511985
          output = output.replace(/[^\s]+/g, function(word) {
            return word.replace(/^./, function(first) {
              return first.toUpperCase();
            });
          });
          break;
        case 'uppercase':
          output = output.toUpperCase();
          break;
        case 'lowercase':
          output = output.toLowerCase();
          break;
      }
    }
  }

  if (options.type && options.type == 'number') {
    if (options.format) {
      console.log(options.format);

      if (options.format.indexOf('.') !== -1) {
        output = (function(num){
          var chop = options.format.split('.');
          var length = chop[chop.length-1].length;
          return num.toFixed(length);
        })(output);
      }

      if (options.format.indexOf(',') !== -1) {
        output = (function(num){
          while (/(\d+)(\d{3})/.test(num.toString())){
            num = num.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
          }
          return num;
        })(output);
        console.log(output);
      }

    }
  }

  if (options.prefix) {
    output = String(options.prefix) + output;
  }

  if (options.suffix) {
    output = output + String(options.suffix);
  }

  return output;
}

// dataform.format(index, options);

// Source: src/lib/sort.js
Dataform.prototype.sort = function(opts){
  var self = this, options;

  if (self.action == 'unpack') {

    options = extend({
      index: false,
      value: false
    }, opts);

    // Sort records by index
    if (options.index) {
      !function(){
        var header = self.table[0],
            body = self.table.splice(1);

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

    // Sort columns (labels) by total values
    if (options.value && self.schema.unpack.label && self.table[0].length > 2) {
      !function(){
        var header = self.table[0],
            body = self.table.splice(1),
            series = [],
            table = [],
            index_cell = (self.schema.unpack.index) ? 0 : -1;

        each(header, function(cell, i){
          if (i > index_cell) {
            series.push({ label: cell, values: [], total: 0 });
          }
        });

        each(body, function(row, i){
          each(row, function(cell, j){
            if (j > index_cell) {
              if (is(cell, 'number')) {
                series[j-1].total += cell;
              }
              series[j-1].values.push(cell);
            }
          });
        });

        if (self.schema.unpack.label.type == 'number' || is(body[0][1], 'number')) {
          series.sort(function(a, b) {
            //console.log(options, self.schema, options.value, a.total, b.total);
            if (options.value == 'asc') {
              if (a.total > b.total) {
                return 1;
              } else {
                return -1
              }
            } else {
              if (a.total > b.total) {
                return -1;
              } else {
                return 1
              }
            }
            return false;
          });
        }

        each(series, function(column, i){
          header[index_cell+1+i] = series[i].label;
          each(body, function(row, j){
            row[index_cell+1+i] = series[i].values[j];
          });
        });

        self.table = [header].concat(body);

      }();
    }
  }

  if (self.action == 'select') {

    options = extend({
      column: 0,
      order: 'asc'
    }, opts);

    !function(){
      var header = self.table[0],
          body = self.table.splice(1);

      body.sort(function(a, b){
        //console.log(a[options.column], b[options.column]);
        if (options.order == 'asc') {
          if (a[options.column] > b[options.column]) {
            return 1;
          } else {
            return -1
          }
        } else {
          if (a[options.column] > b[options.column]) {
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

  return self;
};

// Source: src/lib/average.js
Dataform.prototype.average = function(){
  // return [5];
};

// Source: src/lib/count.js
Dataform.prototype.count = function(){
  // return [10];
};

// Source: src/lib/maximum.js
Dataform.prototype.maximum = function(){
  //if (this.table) {}
  // return Math.max for index/all
  // return [1,2,3,4,5];
  // return [9];
};

// Source: src/lib/median.js
Dataform.prototype.median = function(){
  // return [4.3];
};

// Source: src/lib/minimum.js
Dataform.prototype.minimum = function(){
  //if (this.table) {}
  // return Math.min for index/all
  // return [1,2,3,4,5];
  // return [0];
};

// Source: src/lib/mode.js
Dataform.prototype.mode = function(){
  // return [3];
};

// Source: src/lib/sum.js
Dataform.prototype.sum = function(){
  // return [23];
};
