// Source: src/dataform.js
/*!
  * ----------------
  * Dataform.js
  * ----------------
  */

function Dataform(root, setup) {
  this.build(root, setup);
}

Dataform.prototype.build = function(data, map) {
  // map.root
  // map.each.index
  // map.each.label
  // map.each.value

  var self = this, _root;
  // root = data[map.root];
  if (map.root == "") {
    _root = [[data]];
    //console.log('root', _root[0])
  } else {
    _root = parse.apply(self, [data].concat(map.root.split(" -> ")));
  }
  self.root = _root[0],
  self.map = map,
  self.table = [],
  self.series = [],
  self.raw = data;

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
