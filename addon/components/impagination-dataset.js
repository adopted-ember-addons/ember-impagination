import Ember from 'ember';
import layout from '../templates/components/impagination-dataset';
import Dataset from 'impagination/dataset';

export default Ember.Component.extend({
  layout: layout,
  'load-horizon': 2,
  'unload-horizon': Infinity,
  'page-size': null,
  'fetch': null,
  'read-offset': 0,
  datasetState: null,
  queue: [],
  'auto-update': true,

  records: Ember.computed('datasetState', function() {
    return CollectionInterface.create({
      datasetState: this.get('dataset.state'),
      dataset: this.get('dataset'),
      autoUpdate: this.get('auto-update')
    });
  }),

  dataset: Ember.computed('page-size', 'load-horizon', 'unload-horizon', 'fetch', function() {
    var round = Math.round;
    return new Dataset({
      pageSize: round(this.get('page-size')),
      loadHorizon: round(this.get('load-horizon')),
      unloadHorizon: round(this.get('unload-horizon')),
      fetch: this.get('fetch'),
      observe: (datasetState)=> {
        Ember.run(() => {
          this.safeSet('datasetState', datasetState);
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
    this.get('dataset').setReadOffset(Math.round(this.get('read-offset')) || 0);
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

  objectAt(i) {
    let record = this.datasetState.get(i);
    Ember.run.debounce(this, 'objectReadAt', i, 1, true);
    return record;
  },

  objectReadAt(offset) {
    if(this.get('autoUpdate')) {
      this.get('dataset').setReadOffset(offset);
    }
  },

  slice(start, end) {
    if (typeof start !== "number") {
      start = 0;
    }

    if (typeof end !== "number") {
      end = this.datasetState.length;
    }

    let length = end - start;

    if (length < 0) {
      return [];
    }
    Ember.run.schedule('afterRender', this, 'objectReadAt', start);
    return Array.from(new Array(length), (_, i)=> {
      return this.datasetState.get(start + i);
    });
  }
});
