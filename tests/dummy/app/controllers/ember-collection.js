import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';
import Dataset from 'npm:impagination';

const DEBUG = true;

const { get, set } = Ember;
const { String: { dasherize } } = Ember;

export default Ember.Controller.extend({
  'load-horizon': 30,
  'page-size': 10,
  'unload-horizon': Infinity,

  'on-state': function(dataset) {
    if (DEBUG) { console.log('dataset =', dataset); }
  },

  fetch: function(pageOffset, pageSize, stats) {
    let spectrum = new RGBSpectrum(300).colors;
    let delay = 400; //ms

    return new Ember.RSVP.Promise((resolve)=> {
      setTimeout(()=> {
        stats.totalPages =  Math.ceil( spectrum.length / pageSize);
        let recordOffset = pageOffset * pageSize;
        resolve(spectrum.slice(recordOffset, recordOffset + pageSize));
      }, delay);
    });
  },

  'timeout-ms': 5,

  setReadOffset: task(function * (offset) {
    yield timeout(this.get('timeout-ms'));
    console.log('setReadOffset', offset);
    this.get('dataset').setReadOffset(offset);
  }).restartable(),

  init() {
    this._super(...arguments);

    this.get('dataset').setReadOffset(0);
  },

  model: Ember.computed('datasetStore', function() {
    let dataset = this.get('dataset');
    let store = this.get('datasetStore');

    let Model = Ember.Object.extend(Ember.Array, {
      length: get(this, 'datasetStore').length,
      objectAt: (index) => {
        this.get('setReadOffset').perform(index);
        return get(this, 'datasetStore').getRecord(index);
      }
    });

    return new Model(store);
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

class RGBSpectrum {
  constructor(colorCount) {
    this.colorCount = colorCount;
  }

  get step() {
    return 300 / this.colorCount;
  }

  get colors() {
    return new Array(this.colorCount).fill(0).map((nil, i)=> {
      return {'hsl':`hsl(${this.step * i}, 100%, 50%)`};
    });
  }
}
