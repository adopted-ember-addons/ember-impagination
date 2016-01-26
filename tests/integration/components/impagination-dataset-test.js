/*global it, beforeEach */
/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import {
  describe,
  beforeEach
} from 'mocha';
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
      var fetch = (pageOffset, pageSize, stats)=> {
        return this.server.request(pageOffset, pageSize, stats);
      };
      this.set('fetch', fetch);
    });

    it('renders', function() {
      this.render(hbs`
      {{impagination-dataset
        fetch=fetch
        page-size=10
      }}`);
      expect(this.$()).to.have.length(1);
      expect(this.server.requests.length).to.equal(1);
    });

    it('renders with loadHorizon', function() {
      this.render(hbs`
      {{impagination-dataset
        fetch=fetch
        page-size=5
        load-horizon=15
      }}`);
      expect(this.server.requests.length).to.equal(3);
    });

    describe("exercising the CollectionInterface with {{each}}", function() {
      beforeEach(function() {
        this.set('readOffset', 0);
        this.set('autoUpdate', true);
        this.render(hbs`
        {{#impagination-dataset
          fetch=fetch
          read-offset=readOffset
          page-size=10
          load-horizon=30
          unload-horizon=50
          auto-update=autoUpdate
          as |records|}}
          <div class="records">
            <div class="total">Total Records: {{records.length}}</div>
            <div class="offset">Read Offset: {{records.readOffset}}</div>
          </div>
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
        expect(this.$('.records .total').first().text()).to.equal('Total Records: 30');
        expect(this.$('.records .offset').first().text()).to.equal('Read Offset: 0');
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
          expect(this.$('.record').length).to.equal(30);
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

        it("renders a set of empty records up to the loadHorizon", function() {
          expect(this.$('.records .total').first().text()).to.equal('Total Records: 40');
          expect(this.$('.records .offset').first().text()).to.equal('Read Offset: 0');
          expect(this.$('.record').length).to.equal(40);
          expect(this.$('.record').first().text()).to.equal('');
        });

        describe("resolving fetches with auto-update", function() {
          beforeEach(function() {
            this.server.resolveAll();
          });

          it("renders a set of resolved records up to the loadHorizon", function() {
            expect(this.$('.record').length).to.equal(40);
            expect(this.$('.records .offset').first().text()).to.equal('Read Offset: 0');
          });
        });

        describe("resolving fetches without auto-update", function() {
          beforeEach(function() {
            this.set('autoUpdate', false);
            this.server.resolveAll();
          });

          it("renders a set of resolved records up to the loadHorizon", function() {
            expect(this.$('.record').length).to.equal(40);
            expect(this.$('.records .offset').first().text()).to.equal('Read Offset: 10');
          });
        });

      });

    });
  }
);
