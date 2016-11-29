import Ember from 'ember';
import Dataset from 'npm:impagination';
import layout from '../templates/components/impagination-dataset';

const { get, set } = Ember;
const { String: { dasherize } } = Ember;


// TODO: Since `records` are wrapped in Ember.A() not all these methods are accurate
// We should include Ember.Array methods here instead
const accessors = ['concat', 'includes', 'join', 'slice', 'toString', 'toLocaleString', 'indexOf', 'lastIndexOf'];

const iterators = ['forEach', 'every', 'some', 'filter', 'find', 'findIndex', 'keys', 'map', 'reduce', 'reduceRight', 'values'];

const enumerables = ['objectAt'];

let impaginationGetters = [
  // Coming Soon in impagination@1.0.0-alpha.3
  // 'hasUnrequested', 'hasRequested', 'hasPending', 'hasResolved', 'hasRejected', 'hasUnfetchable',
  'unrequested', 'requested', 'pending', 'resolved', 'rejected', 'unfetchable',
  'pages', 'length'
];

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

  arrayActions: Ember.computed(function() {
    let context = this;
    let arrayActions = [...accessors, ...iterators, ...enumerables].reduce((props, method) => {
      let action = `on-${dasherize(method)}`;
      if (get(this, action)) {
        props[method] = function() {
          context.sendAction(action, get(context, 'dataset'), ...arguments);
          return this._super(...arguments);
        };
      }
      return props;
    }, {});

    return Ember.Mixin.create(arrayActions);
  }),

  Model: Ember.computed('dataset', function() {
    let dataset = this.get('dataset');
    return Ember.Object.extend(Ember.Array, {
      delete: (index) => dataset.delete(index),
      put: (data, index) => dataset.put(data, index),
      post: (data, index) => dataset.post(data, index),
      reset: (offset) => dataset.reset(offset),
      refilter: (callback) => dataset.refilter(callback),
      setReadOffset: (offset) => dataset.setReadOffset(offset)
    });
  }),

  model: Ember.computed('enumerable', 'Model', function() {
    return this.get('Model').extend(get(this, 'enumerable'), get(this, 'arrayActions')).create();
  }),

  datasetStore: Ember.computed('dataset', function() {
    return this.get('dataset').store;
  }),

  enumerable: Ember.computed('datasetStore', function() {
    let datasetStore = get(this, 'datasetStore');

    // All Impaginaiton getters have to be made enumerable to be consumed by Ember.Array
    let enumerableProperties = impaginationGetters.reduce(function(props, getter) {
      props[getter] = {
        enumerable: true, get: function() { return datasetStore[getter]; }
      };
      return props;
    }, {
      objectAt: {
        enumerable: true, value(index) { return datasetStore.getRecord(index);}
      }
    });

    return Object.create(datasetStore, enumerableProperties);
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
