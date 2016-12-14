import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';

const DEBUG = true;

const { get } = Ember;

export default Ember.Controller.extend({
  'load-horizon': 30,
  'page-size': 10,
  'unload-horizon': Infinity,

  'on-observe': function(dataset) {
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

  setReadOffset: task(function * (dataset, offset) {
    yield timeout( get(this, 'timeout-ms') );
    dataset.setReadOffset(offset);
  }).restartable(),

  actions: {
    initializeReadOffset(dataset) {
      this.get('setReadOffset').perform(dataset, 0);
    },

    onObjectAt(dataset, index) {
      this.get('setReadOffset').perform(dataset, index);
    },

    logDatasetState(dataset) {
      if (DEBUG) { console.log('dataset =', dataset); }
    }
  }
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
