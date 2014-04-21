var expect = chai.expect;

describe("dataform", function() {

  beforeEach(function() {
    // console.log("ready");
  });

  describe(".table", function() {

    it("Should have 2 columns, 1 header row, and 16 data rows (2x17)", function(done){
      $.getJSON("./data/git-traffic-data.json", function(response) {
        var dataform = new Dataform(response, {
          root: "counts",
          each: {
            index: "bucket",
            value: "total"
          },
          sort: {
            rows: 'date:asc'
          }
        });
        // console.log(dataform);
        expect(dataform).to.have.property('table');
        expect(dataform.table).to.be.of.length(17);
        expect(dataform.table[0]).to.be.of.length(2);
        expect(dataform.table[0][0]).to.eql("bucket");
        expect(dataform.table[0][1]).to.eql("total");
        done();
      });
    });

  });

});
