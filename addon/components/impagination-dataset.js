import Ember from 'ember';
import layout from '../templates/components/impagination-dataset';
import Dataset from 'impagination/dataset';

export default Ember.Component.extend({
  layout: layout,
  'load-horizon': 2,
  'unload-horizon': Infinity,
  'page-size': null,
  'fetch': null,
  'filter': null,
  datasetState: null,
  queue: [],

  records: Ember.computed('datasetState', function() {
    return CollectionInterface.create({
      datasetState: this.get('dataset.state'),
      dataset: this.get('dataset')
    });
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
        Ember.run(() => {
          this.safeSet('datasetState', datasetState);
          this.sendAction('on-observe', this.get('records'), this._actions);
        });
      }
    });

  }),

  setInitialState: Ember.observer('dataset', function() {
    this.set('datasetState', this.get('dataset.state'));
  }),

  safeSet: function(key, value) {
    if (!this.isDestroyed) { this.set(key, value); }
  },

  didReceiveAttrs() {
    this._super.apply(this, arguments);

    this.setInitialState();
    const readOffset = Math.round(this.get('read-offset')) || 0;
    this.get('dataset').setReadOffset(readOffset);
  },

  actions: {
    reset(offset) {
      offset = (offset >= 0) ? offset : 0;
      this.get('dataset').reset(offset);
    },

    reload(offset) {
      offset = (offset >= 0) ? offset : this.get('datasetState.readOffset');
      this.get('dataset').reload(offset);
    },

    refilter() {
      this.get('dataset').refilter();
    },

    setReadOffset(offset){
      offset = (offset >= 0) ? offset : this.get('datasetState.readOffset');
      this.get('dataset').setReadOffset(offset);
    }
  }
});

var PagesInterface = Ember.Object.extend(Ember.Array, {
  objectAt(i) {
    let page = this.pages[i];
    return page || undefined;
  }
});

var CollectionInterface = Ember.Object.extend(Ember.Array, {
  init() {
    this._super.apply(this, arguments);
    this.length = this.datasetState.length;
  },

  pages: Ember.computed('datasetState.pages', function() {
    return PagesInterface.create({
      length: this.get('datasetState.pages.length'),
      pages: this.get('datasetState.pages')
    });
  }),

  readOffset: Ember.computed.readOnly('datasetState.readOffset'),

  objectReadAt(offset) {
    this.get('dataset').setReadOffset(offset);
  },

  /*
  * Add support for popular Ember rendering components
  * ----------------------------------------------------------
  * In order to fetch additional records on scroll,
  * the underlying Impagination library requires advancing the
  * readOffset on the dataset to the current visible record.
  * Ember-Impagination updates the readOffset by hijacking
  * common Array Iteration functions.
  *
  * The hijacking of Array Iteration functions will be deprecated
  * in the next major release. Ember-Impagination will
  * include recommended Iteration Recipes for advanced customization
  * for your Infinite Dataset Applications.
  */

  // objectAt(idx):
  // * Advance the readOffset to `idx`
  // | =================================================================================
  // | Component / Helper | Release       | URL                                         |
  // | ------------------ |:-------       | :------------------------------------------ |
  // | Ember-Collection   | 1.0.0-alpha.6 | https://github.com/emberjs/ember-collection |
  // | =================================================================================
  objectAt(idx) {
    let record = this.datasetState.get(idx);
    Ember.run.debounce(this, 'objectReadAt', idx, 1, true);
    return record;
  },

  // slice([begin[, end]])
  // Advance the readOffset to `begin`
  // | ========================================================================
  // | Component / Helper | Release | URL                                      |
  // | ------------------ |:------- | :--------------------------------------- |
  // | Virtual-Each       | 0.2.0   | https://github.com/jasonmit/virtual-each |
  // | ========================================================================
  slice(begin, end) {
    if (typeof begin !== "number") {
      begin = 0;
    }

    if (typeof end !== "number") {
      end = this.datasetState.length;
    }

    let length = end - begin;

    if (length < 0) {
      return [];
    }
    Ember.run.schedule('afterRender', this, 'objectReadAt', begin);

    let sliced = [];

    for (let i = 0; i < length; i++) {
      sliced.push(this.datasetState.get(begin + i));
    }

    return sliced;
  },

  // forEach(callback)
  // * Does not advance the readOffset. This must be handled in
  // * the route or a child component. See Dataset Actions in
  // * https://github.com/thefrontside/ember-impagination#dataset-actions
  // | ==============================================================================
  // | Component / Helper | Release | URL                                            |
  // | ------------------ |:------- | :---------------------------------------       |
  // | Smoke-And-Mirrors  | 0.5.2   | https://github.com/runspired/smoke-and-mirrors |
  // | ==============================================================================
  forEach(callback) {
    for (let i = 0; i < this.datasetState.length; i++) {
      callback(this.datasetState.get(i), i);
    }
  }
});
