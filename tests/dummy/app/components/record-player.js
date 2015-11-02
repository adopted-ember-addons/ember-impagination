import Ember from 'ember';
import layout from '../templates/components/record-player';

export default Ember.Component.extend({
  layout: layout,
  classNames: ['record-player'],
  'records': null,
  'pages': null,
  'datasetState': null,
  totalRecords: Ember.computed('datasetState.pages', 'datasetState.pageSize', function(){
    return this.get('datasetState.pages.length') * this.get('datasetState.pageSize');
  }),
  elementWidth: null,
  pageWidth: Ember.computed('incrementWidth', 'datasetState.pageSize', function(){
    return this.get('incrementWidth') * this.get('datasetState.pageSize');
  }),
  incrementWidth: Ember.computed('elementWidth', 'totalRecords', function(){
    return this.get('elementWidth') / this.get('totalRecords');
  }),
  readHeadOffset: Ember.computed('datasetState.readOffset', 'incrementWidth', 'pageWidth', function(){
    let incrementWidth = this.get('incrementWidth');
    return this.get('datasetState.readOffset') * incrementWidth;
  }),
  pageStyle: Ember.computed(function(){
    return Ember.String.htmlSafe("width:"+this.get('pageWidth')+"px;");
  }),
  readHeadStyle: Ember.computed('readHeadOffset', function(){
    return Ember.String.htmlSafe("left:"+this.get('readHeadOffset')+"px;");
  }),
  loadHorizonStyle: Ember.computed('datasetState.loadHorizon', 'pageWidth', 'readHeadOffset', function(){
    let left = this.get('readHeadOffset') - (this.get('datasetState.loadHorizon')*this.get('pageWidth'));
    let width = 2*this.get('datasetState.loadHorizon')*this.get('pageWidth');
    return Ember.String.htmlSafe("left:"+left+"px; width:"+width+"px;");
  }),
  unloadHorizonLeftStyle: Ember.computed('elementWidth', 'datasetState.unloadHorizon', 'pageWidth', 'readHeadOffset', function(){
    let right = this.get('elementWidth') - this.get('readHeadOffset') + (this.get('datasetState.unloadHorizon')*this.get('pageWidth'));
    return Ember.String.htmlSafe("right:"+right+"px;");
  }),
  unloadHorizonRightStyle: Ember.computed('datasetState.unloadHorizon', 'pageWidth', 'readHeadOffset', function(){
    let left = this.get('readHeadOffset') + (this.get('datasetState.unloadHorizon')*this.get('pageWidth'));
    return Ember.String.htmlSafe("left:"+left+"px;");
  }),
  _adjustWidth(){
    this.set('elementWidth', this.$().width());
  },
  didInsertElement: function(){
    this._adjustWidth();
  },
});
