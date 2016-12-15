import Ember from 'ember';
import layout from '../templates/components/impagination-dataset';

const { get } = Ember;
const { String: { dasherize } } = Ember;


// TODO: Since `records` are wrapped in Ember.A() not all these methods are accurate
// We should include Ember.Array methods here instead
const accessors = ['concat', 'includes', 'join', 'slice', 'toString', 'toLocaleString', 'indexOf', 'lastIndexOf'];

const iterators = ['forEach', 'every', 'some', 'filter', 'find', 'findIndex', 'keys', 'map', 'reduce', 'reduceRight', 'values'];

const enumerables = ['objectAt'];

const impaginationGetters = [
  'hasUnrequested', 'hasRequested', 'hasPending', 'hasResolved', 'hasRejected', 'hasUnfetchable',
  'unrequested', 'requested', 'pending', 'resolved', 'rejected', 'unfetchable',
  'pages', 'length', 'pageSize', 'loadHorizon', 'unloadHorizon', 'readOffset', 'stats', 'filter'
];

export default Ember.Component.extend({
  layout: layout,
  tagName: '',
  'load-horizon': null,
  'unload-horizon': Infinity,
  'page-size': null,
  'fetch': null,
  'filter': null,
  'on-init'() {},
  'on-observe'() {},

  // Impagination Dataset Class: `app/components/impagination-dataset`
  Dataset: null,

  init() {
    this._super(...arguments);

    let readOffsetAttrFound = get(this, 'read-offset') >= 0;
    Ember.warn('Ember Impagination: `read-offset` attribute has been removed. Please use the `on-init` function instead.', !readOffsetAttrFound, {id: 'ember-impagination.attributes.read-offset'});

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

  dataset: Ember.computed('page-size', 'load-horizon', 'unload-horizon', 'fetch', 'on-observe', 'filter', function() {
    const round = Math.round;
    let Dataset = get(this, 'Dataset');

    return new Dataset({
      pageSize: round(this.get('page-size')),
      loadHorizon: round(this.get('load-horizon')),
      unloadHorizon: round(this.get('unload-horizon')),
      fetch: this.get('fetch'),
      filter: this.get('filter'),
      observe: (datasetState)=> {
        Ember.run.next(() => {
          if(this.isDestroyed) { return; }
          this.set('datasetState', datasetState);
          this.get('on-observe')(this.get('model'));
        });
      }
    });
  })
});
