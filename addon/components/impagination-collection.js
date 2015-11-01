import Ember from 'ember';
import layout from '../templates/components/impagination-collection';
import Dataset from 'ember-impagination/dataset';

export default Ember.Component.extend({
  layout: layout,
  'initial-read-offset': 0,
  'load-horizon': 1,
  'unload-horizon': Infinity,
  'page-size': null,
  'fetch': null,

  // dataset: null,

  dataset: null,

  datasetState: null,

  queue: [],

  records: Ember.computed('datasetState', function() {
    // TODO: This should fire EVERY TIME we observe a new datasetState
    if(this.get('dataset')){
      var collection = CollectionInterface.create({
        datasetState: this.get('datasetState'),
        objectReadAt: (offset)=> {
          this.queue.push(offset);
          Ember.run.debounce(this, 'flushQueue', offset, 1, false);
        }
      });
      return collection;
    } else {
      return [];
    }
  }),

  pages: Ember.computed('datasetState', function() {
    if(this.get('dataset')){
      var pages = PagesInterface.create({
        datasetState: this.get('datasetState'),
      });
      return pages;
    } else {
      return [];
    }
  }),

  flushQueue: function () {
    if(this.queue.length > 0) {
      Ember.run(() => {
        var avgOffset = Math.ceil((Math.max(...this.queue) + Math.min(...this.queue)) / 2);
        this.dataset.setReadOffset(avgOffset);
        this.queue = [];
      });
    }
  },

  _newDataset: function(){
    this.dataset = new Dataset({
      pageSize: this.get('page-size'),
      loadHorizon: this.get('load-horizon'),
      unloadHorizon: this.get('unload-horizon'),
      initialReadOffset: this.get('initial-read-offset'),
      fetch: this.get('fetch'),
      observe: (datasetState)=> {
        if(this.get('dataset')){
          Ember.run(()=>{
            this.set('datasetState', datasetState);
          });
        }
      }
    });
  },

  didInsertElement(){
    this._newDataset();
  }
});

var PagesInterface = Ember.Object.extend(Ember.Array, {
  objectAt(i) {
    let page = this.datasetState.pages[i];
    return page || undefined;
  },

  length: Ember.computed(function () {
    var lastPage = {
      records: []
    };
    let totalPages = 0;
    let datasetState = this.datasetState;
    if(datasetState && datasetState.pages.length > 0) {
      lastPage = datasetState.pages[datasetState.pages.length - 1];
      totalPages = (datasetState.pages.length);
    }
    return totalPages;
  })
});

var CollectionInterface = Ember.Object.extend(Ember.Array, {
  objectAt(i) {
    let record = this.datasetState.records[i];
    this.objectReadAt(i);
    return record || undefined;
  },

  length: Ember.computed(function () {
    var lastPage = {
      records: []
    };
    let totalRecords = 0;
    let datasetState = this.datasetState;
    if(datasetState && datasetState.pages.length > 0) {
      lastPage = datasetState.pages[datasetState.pages.length -1];
      totalRecords = (datasetState.pages.length - 1) * datasetState.pageSize + lastPage.records.length;
    }
    return totalRecords;
  })
});
