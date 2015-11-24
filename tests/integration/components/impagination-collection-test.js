/*global it, beforeEach */
/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import {
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
    });
  }
);
