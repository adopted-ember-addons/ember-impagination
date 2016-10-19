import Ember from 'ember';
import Dataset from 'npm:impagination';
import layout from '../templates/components/impagination-dataset';

export default Ember.Component.extend({
  layout: layout,
  'load-horizon': null,
  'unload-horizon': Infinity,
  'page-size': null,
  'fetch': null,
  'filter': null,
  'on-init': Ember.K,
  'on-state': Ember.K,

  datasetState: null,

  init() {
    this._super(...arguments);
    this.get('on-init')(this.get('model'));
  },

  model: Ember.computed('datasetState', function() {
    debugger;
    return Object.create(this.get('datasetState'), {
      setReadOffset: {
        enumerable: false,
        writable: false,
        configurable: false,
        value: (offset) => {
          Ember.run.once(() => {
            debugger;
            this.get('dataset').setReadOffset(offset);
          });
        }
      }
    });
  }),

  datasetState: Ember.computed('dataset', function() {
    return this.get('dataset').store;
  }),

  dataset: Ember.computed('page-size', 'load-horizon', 'unload-horizon', 'fetch', 'on-observe', 'filter', function() {
    var round = Math.round;
    return new Dataset({
      pageSize: round(this.get('page-size')),
      loadHorizon: round(this.get('load-horizon')),
      unloadHorizon: round(this.get('unload-horizon')),
      fetch: this.get('fetch'),
      filter: this.get('filter'),
      observe: (datasetState)=> {
        if(this.isDestroyed) { return; }
        Ember.run(() => {
          this.set('datasetState', datasetState);
          this.get('on-state')(this.get('model'));
        });
      }
    });
  })
});
