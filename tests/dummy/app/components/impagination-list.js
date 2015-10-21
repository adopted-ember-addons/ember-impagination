import Ember from 'ember';
import Dataset from 'ember-impagination/dataset';
import layout from '../templates/components/impagination-list';

export default Ember.Component.extend({
  layout: layout,
  'initial-read-offset': 0,
  'load-horizon': 3,
  'unload-horizon': Infinity,
  'page-size': null,
  'fetch': null,

  dataset: null,
  state: null,

  currentState: null,

  records: Ember.computed('state', function() {
    if(this.get('dataset')){
      var collection = CollectionInterface.create({
        state: this.get('state'),
        objectReadAt: (offset)=> {
          console.log('setReadOffset to page = ', Math.floor(offset / 10) );
          // TODO: We need to optimize capturing the readOffset
          // A debounce and schedule once capture the lowest offsets in the scrollable-area
          // we want to capture high offsets as well.
          // Ember.run.scheduleOnce("actions", this.dataset, 'setReadOffset', offset);
          Ember.run(()=>{
            this.dataset.setReadOffset(offset);
          });
        }
      });
      return collection;
    } else {
      return [];
    }
  }),

  didInsertElement(){
    this.dataset = new Dataset({
      pageSize: this.get('page-size'),
      loadHorizon: this.get('load-horizon'),
      unloadHorizon: this.get('unload-horizon'),
      initialReadOffset: this.get('initial-read-offset'),
      fetch: this.get('fetch'),
      observe: (state)=> {
        if(this.get('dataset')){
          Ember.run(()=> {
            this.set('state', state);
          });
        }
      }
    });
  },

});

var CollectionInterface = Ember.Object.extend(Ember.Array, {
  objectAt(i) {
    let record = this.state.records[i];
    console.log("i = ", i);
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
