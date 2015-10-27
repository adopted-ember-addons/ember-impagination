import Ember from 'ember';
import Dataset from 'ember-impagination/dataset';
import layout from '../templates/components/impagination-list';

export default Ember.Component.extend({
  layout: layout,
  'initial-read-offset': 0,
  'load-horizon': 2,
  'unload-horizon': Infinity,
  'page-size': null,
  'fetch': null,

  dataset: null,
  state: null,

  queue: [],

  records: Ember.computed('state', function() {
    // TODO: This should fire EVERY TIME we observe a new state
    if(this.get('dataset')){
      var collection = new ImpaginationVirtualEachAdapter(
        this.get('state'),
        (offset)=> {
          Ember.run(() => {
            this.dataset.setReadOffset(offset);
          });
        }
      );
      return collection;
    } else {
      return [];
    }
  }),

  pages: Ember.computed('state', function() {
    if(this.get('dataset')){
      var pages = PagesInterface.create({
        state: this.get('state')
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
      observe: (state)=> {
        if(this.get('dataset')){
          Ember.run(()=>{
            this.set('state', state);
          });
        }
      }
    });
  },

  // rebuildDataset: Ember.observer('page-size', 'load-horizon', 'unload-horizon', 'initial-read-offset', function(){
  //   this._newDataset();
  // }),

  didInsertElement(){
    this._newDataset();
  }

  // didInitAttrs() {
  //   console.log('pageSize in willRender', this.get('page-size'));
  //   // this._newDataset();
  // },
});

var PagesInterface = Ember.Object.extend(Ember.Array, {
  objectAt(i) {
    let page = this.state.pages[i];
    return page || undefined;
  },

  length: Ember.computed(function () {
    var lastPage = {
      records: []
    };
    let totalPages = 0;
    let state = this.state;
    if(state.pages.length > 0) {
      lastPage = state.pages[state.pages.length - 1];
      totalPages = (state.pages.length);
    }
    return totalPages;
  })
});

var ImpaginationVirtualEachAdapter = class {
  constructor(state, objectReadAt) {
    this.state = state;
    this.objectReadAt = objectReadAt;
  }

  slice(start, end) {
    if(start < 0) { return []; }
    let records = this.state.records.slice(start, end);
    this.objectReadAt(start);
    return records || undefined;
  }

  get length() {
    var lastPage = {
      records: []
    };
    let totalRecords = 0;
    let state = this.state;
    if(state.pages.length > 0) {
      lastPage = state.pages[state.pages.length -1];
      totalRecords = (state.pages.length - 1) * state.pageSize + lastPage.records.length;
    }
    return totalRecords;
  }
};
