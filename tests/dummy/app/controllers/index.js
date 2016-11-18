import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';

const DEBUG = false;

export default Ember.Controller.extend({
  isEmberCollection: false,
  isVirtualEach: false,
  isInViewport: Ember.computed.not('isEmberCollection', 'isVirtualEach'),

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

  filter: function(record) {
    let match = record.hsl.match(/hsl\((.*)\)/);
    match = match ? match.pop() : '';

    let hue = match.split(',')[0];
    return hue % 2 === 0;
  },

  'timeout-ms': 5,

  ddauExtension: ['slice'],

  setReadOffset: task(function * (dataset, offset) {
    yield timeout(this.get('timeout-ms'));
    debugger;
    dataset.setReadOffset(offset);
  }).restartable(),

  initialReadOffset: 0,
  loadHorizon: 30,
  unloadHorizon: 40,
  pageSize: 10,

  actions: {
    initializeReadOffset(dataset) {
      debugger;
      this.get('setReadOffset').perform(dataset, this.get('initialReadOffset'));
    },

    onSlice(dataset, start) {
      this.get('setReadOffset').perform(dataset, start);
    },

    scrollChange(dataset, scrollLeft, scrollTop) {
      let offset = Math.floor(scrollTop / this.get('itemHeight'));
      this.set('scrollLeft', scrollLeft);
      this.set('scrollTop', scrollTop);
      this.get('setReadOffset').perform(dataset, offset);
    },

    setReadOffset(dataset, offset) {
      if (!isNaN(offset)) {
        this.get('setReadOffset').perform(dataset, offset);
      }
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
