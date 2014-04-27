var expect = chai.expect;

describe("dataform", function() {

  beforeEach(function() {
    // console.log("ready");
  });

  describe(".table", function() {

    it("git-traffic-data.json", function(done){
      $.getJSON("./data/git-traffic-data.json", function(response) {
        var dataform = new Dataform(response, {
          collection: "counts",
          select: {
            index: "bucket",
            value: "total"
          },
          sort: {
            index: 'asc'
          }
        });
        console.log('git-traffic-data.json', dataform);
        expect(dataform).to.have.property('table');
        expect(dataform.table).to.be.of.length(17);
        //expect(dataform.table[0]).to.be.of.length(2);
        //expect(dataform.table[0][0]).to.eql("bucket");
        //expect(dataform.table[0][1]).to.eql("total");
        done();
      });
    });

    it("keen2.json", function(done){
      $.getJSON("./data/keen2.json", function(response) {
        var dataform = new Dataform(response, {
          collection: "result",
          select: {
            index: "timeframe -> start",
            value: "value -> result",
            label: "value -> parsed_user_agent.os.family"
          },
          sort: {
            index: 'asc'
          }
        });
        console.log('keen2.json', dataform);
        expect(dataform).to.have.property('table');
        done();
      });
    });

    it("keen.json", function(done){
      $.getJSON("./data/keen.json", function(response) {
        var dataform = new Dataform(response, {
          collection: "result",
          select: {
            index: "timeframe -> start",
            value: "value -> result -> number -> value",
            label: "value -> page"
          },
          sort: {
            index: 'asc'
          }
        });
        console.log('keen.json', dataform);
        expect(dataform).to.have.property('table');
        done();
      });
    });

    it("Rows sorted according to index: asc/desc (twitter.json)", function(done){
      $.getJSON("./data/twitter.json", function(response) {
        var dataform1 = new Dataform(response, {
          collection: "",
          select: {
            index: "created_at",
            value: "text",
            label: "user -> screen_name"
          },
          sort: {
            index: 'asc'
          }
        });
        var dataform2 = new Dataform(response, {
          collection: "",
          select: {
            index: "created_at",
            value: "text",
            label: "user -> screen_name"
          },
          sort: {
            index: 'desc'
          }
        });
        console.log('twitter.json', dataform1);
        console.log('twitter.json', dataform2);
        expect(dataform1).to.have.property('table');
        expect(dataform1.table[0][0]).to.eql("created_at");
        expect(dataform1.table[0][1]).to.eql("larimer");
        expect(dataform1.table[1][0]).to.be.eql('Tue Mar 25 17:39:38 +0000 2014');

        expect(dataform2).to.have.property('table');
        expect(dataform2.table[0][0]).to.eql("created_at");
        expect(dataform2.table[0][1]).to.eql("larimer");
        expect(dataform2.table[1][0]).to.be.eql('Tue Mar 25 20:19:50 +0000 2014');
        done();
      });
    });


  });

});
