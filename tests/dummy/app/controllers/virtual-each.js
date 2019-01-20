import { Promise as EmberPromise } from 'rsvp';
import Controller from '@ember/controller';
import { task, timeout } from 'ember-concurrency';

const DEBUG = true;

export default Controller.extend({

  containerHeight: 600,
  itemHeight: 70,

  fetch: function(pageOffset, pageSize, stats) {
    let spectrum = new RGBSpectrum(300).colors;
    let delay = 400; //ms

    return new EmberPromise((resolve)=> {
      setTimeout(()=> {
        stats.totalPages =  Math.ceil( spectrum.length / pageSize);
        let recordOffset = pageOffset * pageSize;
        resolve(spectrum.slice(recordOffset, recordOffset + pageSize));
      }, delay);
    });
  },

  'timeout-ms': 5,

  setReadOffset: task(function * (dataset, offset) {
    yield timeout(this.get('timeout-ms'));
    console.log('setReadOffset', offset);
    dataset.setReadOffset(offset);
  }).restartable(),

  loadHorizon: 30,
  unloadHorizon: 40,
  pageSize: 10,

  actions: {
    initializeReadOffset(dataset) {
      this.get('setReadOffset').perform(dataset, 0);
    },

    onSlice(dataset, start) {
      this.get('setReadOffset').perform(dataset, start);
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
