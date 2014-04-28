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
          unpack: {
            index: {
              target: "bucket",
              type: "date",
              format: "MMM DD"
            },
            value: "total"
          },
          sort: {
            index: 'asc'
          }
        });
        console.log('git-traffic-data.json', dataform);

        expect(dataform).to.have.property('table');
        expect(dataform.table).to.be.of.length(17);
        expect(dataform.table[0]).to.be.of.length(2);
        expect(dataform.table[0][0]).to.eql("bucket");
        expect(dataform.table[0][1]).to.eql("total");
        done();
      });
    });

    it("keen_groupby.json (pie!)", function(done){
      $.getJSON("./data/keen_groupby.json", function(response) {
        var dataform = new Dataform(response, {
          collection: "result",
          unpack: {
            value: "result",
            label: "page"
          },
          sort: {
            index: 'asc'
          }
        });
        console.log('keen_groupby.json', dataform);

        expect(dataform).to.have.property('table');
        expect(dataform.table).to.be.of.length(56);
        expect(dataform.table[0]).to.be.of.length(2);
        expect(dataform.table[0][0]).to.eql("page");
        expect(dataform.table[0][1]).to.eql("result");
        done();
      });
    });

    it("keen2.json", function(done){
      $.getJSON("./data/keen2.json", function(response) {
        var dataform = new Dataform(response, {
          collection: "result",
          unpack: {
            index: "timeframe -> start",
            value: "value -> result",
            label: "value -> parsed_user_agent.os.family"
          },
          sort: {
            index: 'asc',
            value: 'desc'
          }
        });
        console.log('keen2.json', dataform);

        expect(dataform).to.have.property('table');
        expect(dataform.table).to.be.of.length(7);
        expect(dataform.table[0]).to.be.of.length(3);
        expect(dataform.table[0][0]).to.eql("start");
        expect(dataform.table[0][1]).to.eql("");
        expect(dataform.table[0][2]).to.eql("Windows Vista");
        done();
      });
    });

    it("keen.json 1 (columns sorted DESC)", function(done){
      $.getJSON("./data/keen.json", function(response) {
        var dataform = new Dataform(response, {
          collection: "result",
          unpack: {
            index: "timeframe -> start",
            value: "value -> result -> number -> value",
            label: "value -> page"
          },
          sort: {
            index: 'asc'
          }
        });
        console.log('keen.json 1', dataform);

        expect(dataform).to.have.property('table');
        expect(dataform.table).to.be.of.length(3);
        expect(dataform.table[0]).to.be.of.length(4);
        expect(dataform.table[0][0]).to.eql("start");
        expect(dataform.table[0][1]).to.eql("contact");
        expect(dataform.table[0][2]).to.eql("home");
        expect(dataform.table[0][3]).to.eql("about");
        done();
      });
    });

    it("keen.json 2 (columns sorted ASC)", function(done){
      $.getJSON("./data/keen.json", function(response) {
        var dataform = new Dataform(response, {
          collection: "result",
          unpack: {
            index: "timeframe -> start",
            value: "value -> result -> number -> value",
            label: "value -> page"
          },
          sort: {
            index: 'asc',
            value: 'asc'
          }
        });
        console.log('keen.json 2', dataform);

        expect(dataform).to.have.property('table');
        expect(dataform.table).to.be.of.length(3);
        expect(dataform.table[0]).to.be.of.length(4);
        expect(dataform.table[0][0]).to.eql("start");
        expect(dataform.table[0][1]).to.eql("about");
        expect(dataform.table[0][2]).to.eql("home");
        expect(dataform.table[0][3]).to.eql("contact");
        done();
      });
    });

    it("Rows sorted according to index: asc/desc (twitter.json)", function(done){
      $.getJSON("./data/twitter.json", function(response) {
        var dataform1 = new Dataform(response, {
          collection: "",
          unpack: {
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
          unpack: {
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

        expect(dataform1.table).to.be.of.length(3);
        expect(dataform1.table[0]).to.be.of.length(2);
        expect(dataform1.table[0][0]).to.eql("created_at");
        expect(dataform1.table[0][1]).to.eql("larimer");
        expect(dataform1.table[1][0]).to.be.eql('Tue Mar 25 17:39:38 +0000 2014');

        expect(dataform2.table).to.be.of.length(3);
        expect(dataform2.table[0]).to.be.of.length(2);
        expect(dataform2).to.have.property('table');
        expect(dataform2.table[0][0]).to.eql("created_at");
        expect(dataform2.table[0][1]).to.eql("larimer");
        expect(dataform2.table[1][0]).to.be.eql('Tue Mar 25 20:19:50 +0000 2014');
        done();
      });
    });

    it("keen_metric.json", function(done){
      $.getJSON("./data/keen_metric.json", function(response) {
        var dataform = new Dataform(response, {
          collection: "",
          select: [
            {
              target: "result",
              type: "number",
              label: "Metric",
              format: "1,000.00",
              prefix: "$",
              suffix: " per month"
            }
          ]
        });
        console.log('keen_metric.json', dataform);

        expect(dataform).to.have.property('table');
        expect(dataform.table).to.be.of.length(2);
        expect(dataform.table[0][0]).to.eql("Metric");
        expect(dataform.table[1][0]).to.eql("$2,450.00 per month");
        done();
      });
    });

    it("keen_extraction.json 1", function(done){
      $.getJSON("./data/keen_extraction.json", function(response) {
        var dataform = new Dataform(response, {
          collection: "result",
          select: [
            {
              target: "keen -> timestamp",
              type: "date",
              label: "Time"
            },
            {
              target: "page",
              type: "string",
              label: "Page"
            },
            {
              target: "referrer",
              type: "string",
              label: "Referrer"
            }
          ],
          sort: {
            column: 0,
            order: 'asc'
          }
        });
        console.log('keen_extraction.json 1', dataform);

        expect(dataform).to.have.property('table');
        expect(dataform.table).to.be.of.length(28);
        expect(dataform.table[0]).to.be.of.length(3);
        expect(dataform.table[0][0]).to.eql("Time");
        expect(dataform.table[0][1]).to.eql("Page");
        expect(dataform.table[0][2]).to.eql("Referrer");
        // expect(dataform.table[1][0]).to.be.eql("2014-04-25T20:38:04.084Z");
        done();
      });
    });

    it("keen_extraction.json 2", function(done){
      $.getJSON("./data/keen_extraction.json", function(response) {
        var dataform = new Dataform(response, {
          collection: "result",
          select: [
            {
              target: "keen -> timestamp",
              type: "date"
            },
            {
              target: "page",
              type: "string"
            },
            {
              target: "referrer",
              type: "string",
              prefix: "@",
              suffix: "/mo"
            }
          ],
          sort: {
            column: 1,
            order: 'desc'
          }
        });
        console.log('keen_extraction.json 2', dataform);

        expect(dataform).to.have.property('table');
        expect(dataform.table).to.be.of.length(28);
        expect(dataform.table[0]).to.be.of.length(3);
        expect(dataform.table[0][0]).to.eql("timestamp");
        expect(dataform.table[0][1]).to.eql("page");
        expect(dataform.table[0][2]).to.eql("referrer");
        // expect(dataform.table[1][0]).to.be.eql("2014-04-27T04:41:20.573Z");
        done();
      });
    });

  });

});
