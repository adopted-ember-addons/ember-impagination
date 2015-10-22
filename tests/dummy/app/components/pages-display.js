import Ember from 'ember';
import layout from '../templates/components/pages-display';

export default Ember.Component.extend({
  layout: layout,
  classNames: ['demo_pages_page_wrapper'],
  'records': null,
  'page': null,
  'state': null,
  isCurrentPage: Ember.computed('state.pageOffset', 'page.offset', function(){
    return this.get('state.pageOffset') === this.get('page.offset');
  }),
  isLoadMin: Ember.computed('state.pageOffset','page.offset', 'state.loadHorizon', 'state.stats.totalPages', function(){
    let currentOffset = this.get('state.pageOffset');
    let pageOffset = this.get('page.offset');
    let loadHorizon = this.get('state.loadHorizon');
    let totalPages = this.get('state.stats.totalPages');
    let loadMin = Math.max(0, currentOffset - loadHorizon);
    let loadMax = Math.min(totalPages, currentOffset + loadHorizon - 1);
    return loadMin === pageOffset;
  }),

  isLoadMax: Ember.computed('state.pageOffset','page.offset', 'state.loadHorizon', 'state.stats.totalPages', function(){
    let currentOffset = this.get('state.pageOffset');
    let pageOffset = this.get('page.offset');
    let loadHorizon = this.get('state.loadHorizon');
    let totalPages = this.get('state.stats.totalPages');
    let loadMin = Math.max(0, currentOffset - loadHorizon);
    let loadMax = Math.min(totalPages, currentOffset + loadHorizon - 1);
    return pageOffset === loadMax;
  }),

  isUnloadMin: Ember.computed('state.pageOffset','page.offset', 'state.unloadHorizon', 'state.stats.totalPages', function(){
    let currentOffset = this.get('state.pageOffset');
    let pageOffset = this.get('page.offset');
    let unloadHorizon = this.get('state.unloadHorizon');
    let totalPages = this.get('state.stats.totalPages');
    let unloadMin = Math.max(0, currentOffset - unloadHorizon);
    let unloadMax = Math.min(totalPages, currentOffset + unloadHorizon -1);
    return unloadMin === pageOffset;
  }),

  isUnloadMax: Ember.computed('state.pageOffset','page.offset', 'state.unloadHorizon', 'state.stats.totalPages', function(){
    let currentOffset = this.get('state.pageOffset');
    let pageOffset = this.get('page.offset');
    let unloadHorizon = this.get('state.unloadHorizon');
    let totalPages = this.get('state.stats.totalPages');
    let unloadMin = Math.max(0, currentOffset - unloadHorizon);
    let unloadMax = Math.min(totalPages, currentOffset + unloadHorizon -1);
    return pageOffset === unloadMax;
  }),
});
