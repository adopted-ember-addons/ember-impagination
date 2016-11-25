import Ember from 'ember';
import Dataset from 'npm:impagination';
import layout from '../templates/components/impagination-dataset';

const { get, set } = Ember;
const { String: { dasherize } } = Ember;

export default Ember.Component.extend({
  layout: layout,
  'load-horizon': null,
  'unload-horizon': Infinity,
  'page-size': null,
  'fetch': null,
  'filter': null,
  'on-init': Ember.K,
  'on-state': Ember.K,

  'ddau-extension': null,

  init() {
    this._super(...arguments);
    this.get('on-init')(this.get('model'));
  },

  model: Ember.computed('datasetState', function() {
    let dataset = this.get('dataset');
    let store = this.get('datasetState');

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

    let properties = this.get('ddau-extension') || [];
    properties.forEach((prop) => {
      model[prop] = function() {
        this.sendAction(`on-${dasherize(prop)}`, dataset, ...arguments);
        return store[prop].apply(model, arguments);
      }.bind(this);
    });

    return model;
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
