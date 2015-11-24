import Ember from 'ember';
import layout from '../templates/components/pages-display';

export default Ember.Component.extend({
  layout: layout,
  classNames: ['demo_pages_page_wrapper'],
  // 'records': null,
  'page': null,
  'datasetState': null,
  isCurrentPage: Ember.computed('datasetState.pageOffset', 'page.offset', function(){
    return this.get('datasetState.pageOffset') === this.get('page.offset');
  }),
  isLoadMin: Ember.computed('datasetState.pageOffset','page.offset', 'datasetState.loadHorizon', 'datasetState.stats.totalPages', function(){
    let currentOffset = this.get('datasetState.pageOffset');
    let pageOffset = this.get('page.offset');
    let loadHorizon = this.get('datasetState.loadHorizon');
    let loadMin = Math.max(0, currentOffset - loadHorizon);
    return loadMin === pageOffset;
  }),

  isLoadMax: Ember.computed('datasetState.pageOffset','page.offset', 'datasetState.loadHorizon', 'datasetState.stats.totalPages', function(){
    let currentOffset = this.get('datasetState.pageOffset');
    let pageOffset = this.get('page.offset');
    let loadHorizon = this.get('datasetState.loadHorizon');
    let totalPages = this.get('datasetState.stats.totalPages');
    let loadMax = Math.min(totalPages, currentOffset + loadHorizon - 1);
    return pageOffset === loadMax;
  }),

  isUnloadMin: Ember.computed('datasetState.pageOffset','page.offset', 'datasetState.unloadHorizon', 'datasetState.stats.totalPages', function(){
    let currentOffset = this.get('datasetState.pageOffset');
    let pageOffset = this.get('page.offset');
    let unloadHorizon = this.get('datasetState.unloadHorizon');
    let unloadMin = Math.max(0, currentOffset - unloadHorizon);
    return unloadMin === pageOffset;
  }),

  isUnloadMax: Ember.computed('datasetState.pageOffset','page.offset', 'datasetState.unloadHorizon', 'datasetState.stats.totalPages', function(){
    let currentOffset = this.get('datasetState.pageOffset');
    let pageOffset = this.get('page.offset');
    let unloadHorizon = this.get('datasetState.unloadHorizon');
    let totalPages = this.get('datasetState.stats.totalPages');
    let unloadMax = Math.min(totalPages, currentOffset + unloadHorizon -1);
    return pageOffset === unloadMax;
  }),
});
