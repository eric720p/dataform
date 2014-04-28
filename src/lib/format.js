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
