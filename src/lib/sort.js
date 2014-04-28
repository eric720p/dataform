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
