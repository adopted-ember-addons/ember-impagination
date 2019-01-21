import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from '../templates/components/record-player';

export default Component.extend({
  layout: layout,
  classNames: ['record-player'],
  'records': null,
  'lazy-pages': null,

  elementWidth: null,

  pages: computed('lazy-pages', function() {
    let unrequestedPage = {};
    let pages = this.get('lazy-pages').slice();
    let offset = (pages[0] && pages[0].offset) || 0;
    for(let i = 0; i < offset; i++) {
      pages.unshift(unrequestedPage);
    }
    return pages;
  }),

  pageWidth: computed('incrementWidth', 'lazy-pages', function() {
    let page = this.get('lazy-pages')[0];
    return this.get('incrementWidth') * page.size;
  }),

  incrementWidth: computed('elementWidth', 'records', function() {
    return this.get('elementWidth') / this.get('records').length;
  }),

  readHeadOffset: computed('records', 'incrementWidth', function() {
    let incrementWidth = this.get('incrementWidth');

    return this.get('records').readOffset * incrementWidth;
  }),

  pageStyle: computed('pageWidth', function() {
    return htmlSafe(`width: ${this.get('pageWidth')}px;`);
  }),

  readHeadStyle: computed('readHeadOffset', function() {
    return htmlSafe(`left: ${this.get('readHeadOffset')}px;`);
  }),

  loadHorizonStyle: computed('loadHorizon', 'incrementWidth', 'readHeadOffset', function() {
    let left = this.get('readHeadOffset') - (this.get('loadHorizon') * this.get('incrementWidth'));
    let width = 2 * this.get('loadHorizon') * this.get('incrementWidth');

    return htmlSafe(`left: ${left}px; width: ${width}px;`);
  }),

  unloadHorizonLeftStyle: computed('elementWidth', 'unloadHorizon', 'incrementWidth', 'readHeadOffset', function() {
    let right = this.get('elementWidth') - this.get('readHeadOffset') + (this.get('unloadHorizon')*this.get('incrementWidth'));

    return htmlSafe(`right: ${right}px;`);
  }),

  unloadHorizonRightStyle: computed('unloadHorizon', 'incrementWidth', 'readHeadOffset', function() {
    let left = this.get('readHeadOffset') + (this.get('unloadHorizon')*this.get('incrementWidth'));

    return htmlSafe(`left: ${left}px;`);
  }),

  didReceiveAttrs() {
    let elementWidth = this.$() && this.$().width();
    this.set('elementWidth', elementWidth);
  }
});
