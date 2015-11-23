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
  'impagination-collection',
  'Integration | Component | ImpaginationCollection',
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
      {{impagination-collection
        fetch=fetch
        page-size=10
      }}`);
      expect(this.$()).to.have.length(1);
      expect(this.server.requests.length).to.equal(1);
    });

    it('renders with loadHorizon', function() {
      this.render(hbs`
      {{impagination-collection
        fetch=fetch
        page-size=5
        load-horizon=15
      }}`);
      expect(this.server.requests.length).to.equal(3);
    });

    describe("exercising the CollectionInterface with {{each}}", function() {
      beforeEach(function() {
        this.render(hbs`
        {{#impagination-collection
          fetch=fetch
          initial-read-offset=0
          page-size=10
          load-horizon=30
          unload-horizon=50
          as |records|}}
          <div class="records">Total Records: {{records.length}}</div>
          {{#each records as |record|}}
            <div class="record">{{record.content.name}}</div>
          {{/each}}
        {{/impagination-collection}}
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
          expect(this.$('.record').length).to.equal(30);
          expect(this.$('.record').first().text()).to.equal('');
        });
      });
    });
  }
);
