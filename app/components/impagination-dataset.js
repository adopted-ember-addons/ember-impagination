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
  'read-offset': null,
  'fetch': null,
  'filter': null,
  'on-init': Ember.K,
  'on-observe': Ember.K,

  init() {
    this._super(...arguments);
    this.get('on-init')(this.get('model'));
  },

  didReceiveAttrs(args) {
    this._super(...arguments);
    let { newAttrs } = args;

    // setReadOffset if it changes
    if (newAttrs['read-offset']) {
      let readOffset = this.get('read-offset');
      this.get('dataset').setReadOffset(readOffset);
    };
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

  datasetState: Ember.computed('dataset', function() {
    return this.get('dataset').state;
  }),

  enumerable: Ember.computed('datasetState', function() {
    let datasetState = get(this, 'datasetState');

    // All Impaginaiton getters have to be made enumerable to be consumed by Ember.Array
    let enumerableProperties = impaginationGetters.reduce(function(props, getter) {
      props[getter] = {
        enumerable: true, get: function() { return datasetState[getter]; }
      };
      return props;
    }, {
      objectAt: {
        enumerable: true, value(index) { return datasetState.getRecord(index);}
      }
    });

    return Object.create(datasetState, enumerableProperties);
  }),

  dataset: Ember.computed('page-size', 'load-horizon', 'unload-horizon', 'fetch', 'on-observe', 'filter', 'readOffset', function() {
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
          this.get('on-observe')(this.get('model'));
        });
      }
    });
  })
});
