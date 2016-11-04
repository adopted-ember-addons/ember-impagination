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
  'ddau-extension': null,

  init() {
    this._super(...arguments);
    this.get('on-init')(this.get('model'));
  },

  boundProperties: Ember.computed(function() {
    let component = this;
    let properties = this.get('ddau-extension') || {};
    let definedProperties =  _.cloneDeep(properties);
    Object.keys(definedProperties).forEach((property) => {
      Object.keys(definedProperties[property]).forEach((key) => {
        let value = definedProperties[property][key];
        if (typeof value === 'function') {
          let bound = _.bind(definedProperties[property][key], component);
          definedProperties[property][key] = bound;
        }
      });
    });
    return definedProperties;
  }),


  model: Ember.computed('datasetState', function() {
    return Object.create(this.get('datasetState'), Object.assign({
      setReadOffset: {
        value: (offset) => {
          Ember.run.once(() => {
            this.get('dataset').setReadOffset(offset);
          });
        },
        length: {
          value: this.get('datasetState.length')
        }
      }
    }, this.get('boundProperties')));
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
