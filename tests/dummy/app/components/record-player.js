import Ember from 'ember';
import layout from '../templates/components/record-player';

export default Ember.Component.extend({
  layout: layout,
  classNames: ['record-player'],
  'records': null,
  'lazy-pages': null,
  'datasetState': null,

  elementWidth: null,

  pages: Ember.computed('lazy-pages', function() {
    let unrequestedPage = {};
    let pages = this.get('lazy-pages').slice();
    let offset = (pages[0] && pages[0].offset) || 0;
    for(let i = 0; i < offset; i++) {
      pages.unshift(unrequestedPage);
    }
    return pages;
  }),

  pageWidth: Ember.computed('incrementWidth', 'lazy-pages', function() {
    let page = this.get('lazy-pages')[0];
    return this.get('incrementWidth') * page.size;
  }),

  incrementWidth: Ember.computed('elementWidth', 'records', function() {
    return this.get('elementWidth') / this.get('records').length;
  }),

  readHeadOffset: Ember.computed('records', 'incrementWidth', function() {
    let incrementWidth = this.get('incrementWidth');

    return this.get('records').readOffset * incrementWidth;
  }),

  pageStyle: Ember.computed('pageWidth', function() {
    return Ember.String.htmlSafe(`width: ${this.get('pageWidth')}px;`);
  }),

  readHeadStyle: Ember.computed('readHeadOffset', function() {
    return Ember.String.htmlSafe(`left: ${this.get('readHeadOffset')}px;`);
  }),

  loadHorizonStyle: Ember.computed('loadHorizon', 'incrementWidth', 'readHeadOffset', function() {
    let left = this.get('readHeadOffset') - (this.get('loadHorizon') * this.get('incrementWidth'));
    let width = 2 * this.get('loadHorizon') * this.get('incrementWidth');

    return Ember.String.htmlSafe(`left: ${left}px; width: ${width}px;`);
  }),

  unloadHorizonLeftStyle: Ember.computed('elementWidth', 'unloadHorizon', 'incrementWidth', 'readHeadOffset', function() {
    let right = this.get('elementWidth') - this.get('readHeadOffset') + (this.get('unloadHorizon')*this.get('incrementWidth'));

    return Ember.String.htmlSafe(`right: ${right}px;`);
  }),

  unloadHorizonRightStyle: Ember.computed('unloadHorizon', 'incrementWidth', 'readHeadOffset', function() {
    let left = this.get('readHeadOffset') + (this.get('unloadHorizon')*this.get('incrementWidth'));

    return Ember.String.htmlSafe(`left: ${left}px;`);
  }),

  didInsertElement() {
    let elementWidth = this.$() && this.$().width();
    this.set('elementWidth', elementWidth);
  }
});
