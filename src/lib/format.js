Dataform.prototype.format = function(opts){
  var self = this, options;

    var defaults = {
      'number': {
        //format: '0', // 1,000.00
        //prefix: '',
        //suffix: ''
        //modifier: '*1'
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
            if (options[j] && options[j].label) {
              self.table[i][j] = options[j].label;
            }
          });

        } else {

          each(row, function(cell, j){
            self.table[i][j] = _applyFormat(self.table[i][j], options[j]);
          });
        }

      });

    }


  //////////////////////////////////


  if (self.action == 'unpack') {
    options = {};
    each(opts, function(option, key){
      var copy = {}, output;
      each(defaults, function(hash, key){
        copy[key] = extend({}, hash);
      });
      options[key] = (copy[key]) ? extend(copy[key], option) : option;
    });

    if (options.index) {
      each(self.table, function(row, i){
        if (i == 0) {
          if (options.index.label) {
            self.table[i][0] = options.index.label;
          }
        } else {
          self.table[i][0] = _applyFormat(self.table[i][0], options.index);
        }
      });
    }

    if (options.label) {
      if (options.index) {
        each(self.table, function(row, i){
          each(row, function(cell, j){
            if (i == 0 && j > 0) {
              self.table[i][j] = _applyFormat(self.table[i][j], options.label);
            }
          });
        });
      } else {
        each(self.table, function(row, i){
          if (i > 0) {
            self.table[i][0] = _applyFormat(self.table[i][0], options.label);
          }
        });
        //console.log('label, NO index');
      }
    }

    if (options.value) {
      if (options.index) {
        // start > 0
        each(self.table, function(row, i){
          each(row, function(cell, j){
            if (i > 0 && j > 0) {
              self.table[i][j] = _applyFormat(self.table[i][j], options.value);
            }
          });
        });
      } else {
        // start @ 0
        each(self.table, function(row, i){
          each(row, function(cell, j){
            if (i > 0) {
              self.table[i][j] = _applyFormat(self.table[i][j], options.value);
            }
          });
        });
      }
    }

  }

  //console.log(self.table);
  return self;
};

function _applyFormat(value, opts){
  var output = value,
      options = opts || {};

  if (options.method) {
    var copy = output, method = window;
    each(options.method.split("."), function(str, i){
      if (method[str]){
        method = method[str];
      }
    });
    if (typeof method === 'function') {
      try {
        output = method.apply(null, [output, options]);
      }
      catch (e) {
        output = copy;
      }
    }
  }

  if (options.replace) {
    each(options.replace, function(val, key){
      if (output == key || String(output) == String(key) || parseFloat(output) == parseFloat(key)) {
        output = val;
      }
    });
  }

  if (options.type && options.type == 'date') {

    if (options.format && moment && moment(value).isValid()) {
      output = moment(output).format(options.format);
    } else {
      output = new Date(output); //.toISOString();
    }

  }

  if (options.type && options.type == 'string') {

    output = String(output);

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

  if (options.type && options.type == 'number' && !isNaN(parseFloat(output))) {

    output = parseFloat(output);

    if (options.format) {

      // Set decimals
      if (options.format.indexOf('.') !== -1) {
        output = (function(num){
          var chop = options.format.split('.');
          var length = chop[chop.length-1].length;
          return num.toFixed(length);
        })(output);
      }

      // Set commas
      if (options.format.indexOf(',') !== -1) {
        output = (function(num){
          var split = String(num).split(".");
          while (/(\d+)(\d{3})/.test(split[0])){
            split[0] = split[0].replace(/(\d+)(\d{3})/, '$1'+','+'$2');
          }
          return split.join(".");
        })(output);
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
