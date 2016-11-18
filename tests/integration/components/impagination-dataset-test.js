/* jshint expr:true */
import { expect } from 'chai';
import { describeComponent, it } from 'ember-mocha';
import { describe, beforeEach } from 'mocha';
import hbs from 'htmlbars-inline-precompile';
import { Server } from '../../test-server';

describeComponent(
  'impagination-dataset',
  'Integration | Component | ImpaginationDataset',
  {
    integration: true
  },
  function() {
    beforeEach(function() {
      this.server = new Server();
      var fetch = (pageOffset, pageSize, stats) => {
        return this.server.request(pageOffset, pageSize, stats);
      };
      var init = (dataset) => {
        dataset.setReadOffset(0);
      };
      this.set('init', init);
      this.set('fetch', fetch);
    });

    it('renders', function() {
      this.render(hbs`
      {{impagination-dataset
        on-init=init
        fetch=fetch
        page-size=10
      }}`);
      expect(this.$()).to.have.length(1);
      expect(this.server.requests.length).to.equal(1);
    });

    it('renders with loadHorizon', function() {
      this.render(hbs`
      {{impagination-dataset
        on-init=init
        fetch=fetch
        page-size=5
        load-horizon=15
      }}`);
      expect(this.server.requests.length).to.equal(3);
    });

    describe("exercising the CollectionInterface with {{each}}", function() {
      beforeEach(function() {
        this.set('readOffset', 0);
        this.render(hbs`
        {{#impagination-dataset
          on-init=init
          fetch=fetch
          read-offset=readOffset
          page-size=10
          load-horizon=30
          unload-horizon=50
          as |records|}}
          <div class="records">Total Records: {{records.length}}</div>
          {{#each records as |record|}}
            <div class="record">{{record.content.name}}</div>
          {{/each}}
        {{/impagination-dataset}}
        `);
      });

      it("requests pages from the server", function() {
        expect(this.server.requests.length).to.equal(3);
      });

      it("renders a set of empty records up to the loadHorizon", function() {
        expect(this.$('.records').first().text()).to.equal('Total Records: 30');
        expect(this.$('.record').length).to.equal(30);
        expect(this.$('.record').first().text()).to.equal('');
      });

      describe("resolving fetches", function() {
        beforeEach(function() {
          this.server.resolveAll();
        });

        it("renders a set of resolved records up to the loadHorizon", function() {
          expect(this.$('.record').length).to.equal(30);
          expect(this.$('.record').first().text()).to.equal('Record 0');
        });
      });

      describe("rejecting fetches", function() {
        beforeEach(function() {
          this.server.rejectAll();
        });

        it("renders empty rejected records up to the loadHorizon", function() {
          expect(this.$('.record').length).to.equal(0);
        });
      });

      describe("incrementing the readOffset", function() {
        beforeEach(function() {
          // TODO: I prefer the API of Passing-In a `readOffset`
          // `on-init` is okay, but shouldn't be the only way to
          // set the read offset
          this.set('readOffset', 10);
        });

        it("requests another page from the server", function() {
          expect(this.server.requests.length).to.equal(4);
        });
      });
    });

    describe("exercising the CollectionInterface with {{virtual-each}}", function() {
      beforeEach(function() {
        this.set('readOffset', 0);
        this.render(hbs`
        {{#impagination-dataset
          on-init=init
          fetch=fetch
          read-offset=readOffset
          page-size=10
          load-horizon=30
          unload-horizon=50
          as |records|}}
          <div class="records">Total Records: {{records.length}}</div>
          {{#virtual-each records
            height=450
            itemHeight=90
            as |record|}}
            <div class="record">{{record.content.name}}</div>
          {{/virtual-each}}
        {{/impagination-dataset}}
        `);
      });

      it("requests pages from the server", function() {
        expect(this.server.requests.length).to.equal(3);
      });

      it("renders a set of empty records in the viewport", function() {
        expect(this.$('.records').first().text()).to.equal('Total Records: 30');
        expect(this.$('.record').length).to.equal(6);
        expect(this.$('.record').first().text()).to.equal('');
      });

      describe("resolving fetches", function() {
        beforeEach(function() {
          this.server.resolveAll();
        });

        it("renders a set of resolved records up to the loadHorizon", function() {
          expect(this.$('.record').length).to.equal(6);
          expect(this.$('.record').first().text()).to.equal('Record 0');
        });
      });

      describe("rejecting fetches", function() {
        beforeEach(function() {
          this.server.rejectAll();
        });

        it("renders empty rejected records up to the loadHorizon", function() {
          expect(this.$('.record').length).to.equal(6);
          expect(this.$('.record').first().text()).to.equal('');
        });
      });

      describe("incrementing the readOffset", function() {
        beforeEach(function() {
          this.set('readOffset', 10);
        });

        it("requests another page from the server", function() {
          expect(this.server.requests.length).to.equal(4);
        });
      });
    });
    describe("filtering records", function() {
      beforeEach(function() {
        var evenRecords = (record)=> {
          return record.id % 2 === 0;
        };
        this.set('filter', evenRecords);
        this.set('readOffset', 0);
        this.render(hbs`
        {{#impagination-dataset
          on-init=init
          fetch=fetch
          filter=filter
          read-offset=readOffset
          page-size=10
          load-horizon=30
          unload-horizon=50
          as |filteredRecords|}}
          <div class="filtered_records">Total Filtered Records: {{filteredRecords.length}}</div>
          {{#each filteredRecords as |record|}}
            <div class="record">{{record.content.name}}</div>
          {{/each}}
        {{/impagination-dataset}}
        `);
      });

      it("requests pages from the server", function() {
        expect(this.server.requests.length).to.equal(3);
      });

      it("renders a set of empty records up to the loadHorizon", function() {
        expect(this.$('.filtered_records').first().text()).to.equal('Total Filtered Records: 30');
      });

      describe("resolving fetches", function() {
        beforeEach(function() {
          this.server.resolveAll();
        });

        it("filters out half the records", function() {
          expect(this.$('.filtered_records').first().text()).to.equal('Total Filtered Records: 15');
        });
      });
    });
    describe("observing the dataset", function() {
      beforeEach(function() {
        this.observedDatasetCounter = 0;
        var observeDataset = (dataset, actions) => {
          this.dataset = dataset;
          this.actions = actions;
          this.observedDatasetCounter++;
        };

        this.set('observeDataset', observeDataset);
        this.render(hbs`
        {{#impagination-dataset
          on-init=init
          fetch=fetch
          page-size=10
          on-state=observeDataset
          as |records|}}
          <div class="records">Total Records: {{records.length}}</div>
        {{/impagination-dataset}}
        `);
      });

      it("fires the on-observe action", function() {
        expect(this.observedDatasetCounter).to.equal(1);
        expect(this.dataset.get('readOffset')).to.equal(0);
      });

      describe("resolving fetches", function() {
        beforeEach(function() {
          this.server.resolveAll();
        });

        it("fires the on-observe action again", function() {
          expect(this.server.requests.length).to.equal(1);
          expect(this.observedDatasetCounter).to.equal(2);
        });
      });

      describe("firing a setReadOffset Action", function() {
        beforeEach(function() {
          let setReadOffset = this.actions.setReadOffset;
          setReadOffset.call(this.dataset, 10);
        });

        it("sets the new read offset on the observed dataset", function() {
          expect(this.dataset.get('readOffset')).to.equal(10);
        });

        it("requests an additional page from the server", function() {
          expect(this.server.requests.length).to.equal(2);
        });
      });
    });
    describe("observing the dataset", function() {
      beforeEach(function() {
        this.observedDatasetCounter = 0;
        var observeDataset = (dataset, actions) => {
          this.dataset = dataset;
          this.actions = actions;
          this.observedDatasetCounter++;
        };

        this.set('observeDataset', observeDataset);
        this.render(hbs`
        {{#impagination-dataset
          fetch=fetch
          page-size=10
          on-state=observeDataset
          as |records|}}
          <div class="records">Total Records: {{records.length}}</div>
        {{/impagination-dataset}}
        `);
      });

      it("fires the on-observe action", function() {
        expect(this.observedDatasetCounter).to.equal(1);
        expect(this.dataset.get('readOffset')).to.equal(0);
      });

      describe("resolving fetches", function() {
        beforeEach(function() {
          this.server.resolveAll();
        });

        it("fires the on-observe action again", function() {
          expect(this.server.requests.length).to.equal(1);
          expect(this.observedDatasetCounter).to.equal(2);
        });
      });

      describe("firing a setReadOffset Action", function() {
        beforeEach(function() {
          let setReadOffset = this.actions.setReadOffset;
          setReadOffset.call(this.dataset, 10);
        });

        it("sets the new read offset on the observed dataset", function() {
          expect(this.dataset.get('readOffset')).to.equal(10);
        });

        it("requests an additional page from the server", function() {
          expect(this.server.requests.length).to.equal(2);
        });
      });
    });
  }
);
