import Ember from 'ember';
import Dataset from 'npm:impagination';
import layout from '../templates/components/impagination-dataset';

const { get, set } = Ember;
const { String: { dasherize } } = Ember;

const accessors = ['concat', 'includes', 'join', 'slice', 'toString', 'toLocaleString', 'indexOf', 'lastIndexOf'];

const iterators = ['forEach', 'every', 'some', 'filter', 'find', 'findIndex', 'keys', 'map', 'reduce', 'reduceRight', 'values'];

export default Ember.Component.extend({
  layout: layout,
  'load-horizon': null,
  'unload-horizon': Infinity,
  'page-size': null,
  'fetch': null,
  'filter': null,
  'on-init': Ember.K,
  'on-state': Ember.K,

  init() {
    this._super(...arguments);
    this.get('on-init')(this.get('model'));
  },

  model: Ember.computed('datasetStore', function() {
    let dataset = this.get('dataset');
    let store = this.get('datasetStore');

    let model = Object.create(store, {
      // Template Actions
      delete: {
        value: (index) => dataset.delete(index)
      },
      put: {
        value: (data, index) => dataset.put(data, index)
      },
      post: {
        value: (data, index) => dataset.post(data, index)
      },
      reset: {
        value: (offset) => dataset.reset(offset)
      },
      refilter: {
        value: (callback) => dataset.refilter(callback)
      },
      setReadOffset: {
        value: (offset) => {
          dataset.setReadOffset(offset);
        }
      }
    });


    let methods = accessors.concat(iterators);
    methods.forEach((method) => {
      let action = `on-${dasherize(method)}`;
      if(this.get(action)) {
        model[method] = function() {
          this.sendAction(action, dataset, ...arguments);
          return store[method].apply(model, arguments);
        }.bind(this);
      }
    });

    return model;
  }),

  datasetStore: Ember.computed('dataset', function() {
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
      observe: (datasetStore)=> {
        if(this.isDestroyed) { return; }
        Ember.run(() => {
          this.set('datasetStore', datasetStore);
          this.get('on-state')(this.get('model'));
        });
      }
    });
  })
});
