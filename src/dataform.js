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
