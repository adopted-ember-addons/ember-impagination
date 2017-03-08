/* jshint expr:true */
import { expect } from 'chai';
import { setupComponentTest } from 'ember-mocha';
import { describe, beforeEach, it } from 'mocha';
import hbs from 'htmlbars-inline-precompile';
import { Server } from '../../test-server';

import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | ImpaginationDataset', function() {
  setupComponentTest('impagination-dataset', {
    integration: true
  });

  let fetch, init, observe;

  beforeEach(function() {
    this.server = new Server();

    fetch = (pageOffset, pageSize, stats) => {
      return this.server.request(pageOffset, pageSize, stats);
    };

    init = sinon.spy((dataset) => {
      dataset.setReadOffset(0);
    });

    observe = sinon.spy();

    this.set('init', init);
    this.set('fetch', fetch);
    this.set('observe', observe);
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

  describe("observing the model", function() {
    beforeEach(function(done) {
      this.set('pageSize', 10);
      this.render(hbs`
        {{impagination-dataset
            on-init=init
            on-observe=observe
            fetch=fetch
            page-size=pageSize
            load-horizon=30
            unload-horizon=50
        }}
        `);

      return wait().then(() => done());
    });

    it("requests pages from the server", function() {
      expect(this.server.requests.length).to.equal(3);
    });

    it("yields a set of empty records up to the loadHorizon", function() {
      // Observe Called Once to set read offset
      expect(observe.calledOnce).to.be.true;

      let spyCall = observe.firstCall;
      let model = spyCall.args[0];

      // All records are Pending
      expect(model.length).to.equal(30);
      expect(model.every((record) => record.isPending)).to.equal(true);

      // All Pages are Pending Pages
      expect(model.pages.length).to.equal(3);
      expect(model.pages.every((page) => page.isPending)).to.equal(true);

      // Record at index 0
      let first = model.objectAt(0);
      expect(first.content).to.be.null;
    });

    describe("when the dataset is recomputed", function() {
      beforeEach(function() {
        this.set('pageSize', 100);
      });
      it("fires the on-init hook again", function() {
        expect(init.calledTwice).to.equal(true);
      });
    });


    describe("resolving fetches", function() {
      beforeEach(function(done) {
        this.server.resolveAll();
        wait().then(() => done());
      });

      it("yields a set of resolved records up to the loadHorizon", function() {
        // Observe Called Once to set read offset
        expect(observe.callCount).to.equal(4);

        let spyCall = observe.lastCall;
        let model = spyCall.args[0];

        // All records are Resolved
        expect(model.length).to.equal(30);
        expect(model.every((record) => record.isResolved)).to.equal(true);

        // All Pages are Resolved Pages
        expect(model.pages.length).to.equal(3);
        expect(model.pages.every((page) => page.isResolved)).to.equal(true);

        // Record at index 0
        let first = model.objectAt(0);
        expect(first.content).to.deep.equal({ id: 0, name: 'Record 0' });
      });
    });

    describe("rejecting fetches", function() {
      beforeEach(function(done) {
        this.server.rejectAll();
        wait().then(() => done());
      });

      it("yields empty rejected records up to the loadHorizon", function() {
        // Observe Called Once to set read offset
        expect(observe.callCount).to.equal(4);

        let pageSize = this.get('pageSize');

        for(let i = 0; i < observe.callCount; i++) {
          let spyCall = observe.getCall(i);
          let model = spyCall.args[0];

          // length decreases for each rejected page
          // model.length: 30 -> 20 -> 10 -> 0
          let length = 30 - (pageSize * i);
          expect(model.length).to.equal(length);
        }

        let spyCall = observe.lastCall;
        let model = spyCall.args[0];

        // Rejected Records are not present
        expect(model.length).to.equal(0);

        // All Pages are Rejected Pages
        expect(model.pages.length).to.equal(3);
        expect(model.pages.every((page) => page.isRejected)).to.equal(true);
      });
    });

    describe("incrementing the readOffset", function() {
      beforeEach(function(done) {
        let spyCall = observe.firstCall;
        let model = spyCall.args[0];

        model.setReadOffset(10);
        return wait().then(() => done());
      });

      it("requests another page from the server", function() {
        expect(this.server.requests.length).to.equal(4);

        // Observe Called Twice now
        // Once `on-init` hook
        // Once for `setReadOffset`
        expect(observe.calledTwice).to.equal(true);
      });
    });
  });

  describe("filtering records", function() {
    beforeEach(function(done) {
      var evenRecords = (record)=> {
        return record.id % 2 === 0;
      };

      this.set('filter', evenRecords);
      this.set('pageSize', 10);

      this.render(hbs`
        {{impagination-dataset
          on-init=init
          on-observe=observe
          fetch=fetch
          filter=filter
          page-size=pageSize
          load-horizon=30
          unload-horizon=50
        }}
        `);
      return wait().then(() => done());
    });

    it("requests pages from the server", function() {
      expect(this.server.requests.length).to.equal(3);
    });

    it("yields a set of empty records up to the loadHorizon", function() {
      // Observe Called Once to set read offset
      expect(observe.calledOnce).to.be.true;

      let spyCall = observe.firstCall;
      let model = spyCall.args[0];

      // All records are Pending
      expect(model.length).to.equal(30);
      expect(model.every((record) => record.isPending)).to.equal(true);

      // All Pages are Pending Pages
      expect(model.pages.length).to.equal(3);
      expect(model.pages.every((page) => page.isPending)).to.equal(true);

      // Record at index 0
      let first = model.objectAt(0);
      expect(first.content).to.be.null;
    });

    describe("resolving fetches", function() {
      beforeEach(function(done) {
        this.server.resolveAll();
        wait().then(() => done());
      });

      it("yields a set of filtered records up to the loadHorizon", function() {
        // Observe Called Once to set read offset
        expect(observe.callCount).to.equal(4);

        let filteredPageSize = this.get('pageSize') / 2;

        for(let i = 0; i < observe.callCount; i++) {
          let spyCall = observe.getCall(i);
          let model = spyCall.args[0];

          // length decreases for each filtered page
          // model.length: 30 -> 25 -> 20 -> 15
          let length = 30 - (filteredPageSize * i);
          expect(model.length).to.equal(length);
        }
      });
    });
  });
});
