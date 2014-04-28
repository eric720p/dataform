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
        format: 'MMM DD, YYYY'
      },
      'string': {
        format: 'capitalize',
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

// dataform.format(index, options);
