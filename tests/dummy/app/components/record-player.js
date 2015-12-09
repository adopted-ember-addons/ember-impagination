import Ember from 'ember';
import layout from '../templates/components/record-player';

export default Ember.Component.extend({
  layout: layout,
  classNames: ['record-player'],
  'records': null,
  'pages': null,
  'datasetState': null,
  elementWidth: null,
  totalRecords: Ember.computed.readOnly('records.length'),

  pageWidth: Ember.computed('incrementWidth', 'pages.firstObject.size', function() {
    return this.get('incrementWidth') * this.get('pages.firstObject.size');
  }),

  incrementWidth: Ember.computed('elementWidth', 'totalRecords', function() {
    return this.get('elementWidth') / this.get('totalRecords');
  }),

  readHeadOffset: Ember.computed('records.readOffset', 'incrementWidth', function() {
    let incrementWidth = this.get('incrementWidth');

    return this.get('records.readOffset') * incrementWidth;
  }),

  pageStyle: Ember.computed('pageWidth', function() {
    return Ember.String.htmlSafe(`width: ${this.get('pageWidth')}px;`);
  }),

  readHeadStyle: Ember.computed('readHeadOffset', function() {
    return Ember.String.htmlSafe(`left: ${this.get('readHeadOffset')}px;`);
  }),

  loadHorizonStyle: Ember.computed('loadHorizon', 'incrementWidth', 'readHeadOffset', 'pages.firstObject', function() {
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

  _adjustWidth() {
    this.set('elementWidth', this.$().width());
  },

  didInsertElement: function() {
    this._adjustWidth();
  }
});
