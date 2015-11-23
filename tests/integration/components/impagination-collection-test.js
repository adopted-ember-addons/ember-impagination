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

    describe("reading records from the begining with {{each}}", function() {
      beforeEach(function() {
        this.render(hbs`
        {{#impagination-collection
          fetch=fetch
          initial-read-offset=0
          page-size=10
          load-horizon=30
          unload-horizon=50
          as |records|}}
          {{#each records as |record|}}
            <p class="record">{{record.content.name}}</p>
          {{/each}}
        {{/impagination-collection}}
        `);
      });
      it("renders a set of empty records up to the loadHorizon", function() {
        expect(this.$('p.record').length).to.equal(30);
        expect(this.$('p.record').first().text()).to.equal('');
      });

      describe("resolving fetches", function() {
        beforeEach(function() {
          this.server.resolveAll();
        });

        it("renders a set of resolved records up to the loadHorizon", function() {
          expect(this.$('p').length).to.equal(30);
          expect(this.$('p').first().text()).to.equal('Record 0');
        });
      });
    });
    describe("reading records from the middle with {{each}}", function() {
      beforeEach(function() {
        this.render(hbs`
        {{#impagination-collection
          fetch=fetch
          initial-read-offset=30
          page-size=10
          load-horizon=30
          unload-horizon=50
          as |records|}}
          <p class="records">{{records.length}}</p>
        {{/impagination-collection}}
        `);
      });

      describe("resolving fetches", function() {
        beforeEach(function() {
          this.server.resolveAll();
        });

        it("renders a set of resolved records up to the loadHorizon", function() {
          expect(this.$('p').first().text()).to.equal('60');
        });
      });
    });
  }
);
