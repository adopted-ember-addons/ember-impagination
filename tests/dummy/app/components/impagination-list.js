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

  currentState: null,
  queue: [],

  records: Ember.computed('state', function() {
    // TODO: This should fire EVERY TIME we observe a new state
    if(this.get('dataset')){
      var collection = CollectionInterface.create({
        state: this.get('state'),
        objectReadAt: (offset)=> {
          this.queue.push(offset);
          Ember.run.debounce(this, 'flushQueue', offset, 25, false);
        }
      });
      return collection;
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

  didInsertElement(){
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
  }
});

var CollectionInterface = Ember.Object.extend(Ember.Array, {
  objectAt(i) {
    let record = this.state.records[i];
    this.objectReadAt(i);
    return record || undefined;
  },

  length: Ember.computed(function () {
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
  })
});
