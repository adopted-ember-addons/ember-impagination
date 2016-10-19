import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';

export default Ember.Controller.extend({
  isEmberCollection: true,

  containerHeight: 600,
  itemHeight: 70,

  scrollLeft: 0,
  scrollTop: 0,

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

  'timeout-ms': 75,

  setReadOffset: task(function * (dataset, offset) {
    yield timeout(this.get('timeout-ms'));
    dataset.setReadOffset(offset);
  }).restartable(),

  initialReadOffset: 0,
  loadHorizon: 30,
  unloadHorizon: 40,
  pageSize: 10,

  actions: {
    initializeReadOffset(dataset) {
      this.get('setReadOffset').perform(dataset, this.get('initialReadOffset'));
    },

    scrollChange(dataset, scrollLeft, scrollTop) {
      let offset = Math.floor(scrollTop / this.get('itemHeight'));
      this.set('scrollLeft', scrollLeft);
      this.set('scrollTop', scrollTop);
      this.get('setReadOffset').perform(dataset, offset);
    },

    setReadOffset(dataset, offset) {
      this.get('setReadOffset').perform(dataset, offset);
    },

    logDatasetState(dataset) {
      console.log(dataset);
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
