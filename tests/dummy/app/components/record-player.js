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
  pageWidth: Ember.computed('incrementWidth', 'pages.firstObject', function(){
    return this.get('incrementWidth') * this.get('pages.firstObject.size');
  }),
  incrementWidth: Ember.computed('elementWidth', 'totalRecords', function(){
    return this.get('elementWidth') / this.get('totalRecords');
  }),
  readHeadOffset: Ember.computed('records.readOffset', 'incrementWidth', 'pageWidth', function(){
    let incrementWidth = this.get('incrementWidth');
    return this.get('records.readOffset') * incrementWidth;
  }),
  pageStyle: Ember.computed('pageWidth', function() {
    return Ember.String.htmlSafe("width:"+this.get('pageWidth')+"px;");
  }),
  readHeadStyle: Ember.computed('readHeadOffset', function(){
    return Ember.String.htmlSafe("left:"+this.get('readHeadOffset')+"px;");
  }),
  loadHorizonStyle: Ember.computed('loadHorizon', 'pageWidth', 'readHeadOffset', 'pages.firstObject', function(){
    let left = this.get('readHeadOffset') - (this.get('loadHorizon')*this.get('pageWidth')) / this.get('pages.firstObject.size');
    let width = 2*this.get('loadHorizon')*this.get('pageWidth') / this.get('pages.firstObject.size');

    return Ember.String.htmlSafe("left:"+left+"px; width:"+width+"px;");
  }),
  unloadHorizonLeftStyle: Ember.computed('elementWidth', 'unloadHorizon', 'pageWidth', 'readHeadOffset', function(){
    let right = this.get('elementWidth') - this.get('readHeadOffset') + (this.get('unloadHorizon')*this.get('pageWidth'));
    return Ember.String.htmlSafe("right:"+right+"px;");
  }),
  unloadHorizonRightStyle: Ember.computed('unloadHorizon', 'pageWidth', 'readHeadOffset', function(){
    let left = this.get('readHeadOffset') + (this.get('unloadHorizon')*this.get('pageWidth'));
    return Ember.String.htmlSafe("left:"+left+"px;");
  }),
  _adjustWidth(){
    this.set('elementWidth', this.$().width());
  },
  didInsertElement: function(){
    this._adjustWidth();
  },
});
