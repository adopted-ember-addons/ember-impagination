import { Promise as EmberPromise } from 'rsvp';
import Controller from '@ember/controller';

const DEBUG = true;

export default Controller.extend({
  containerHeight: 600,
  itemHeight: 70,

  fetch: function(pageOffset, pageSize) {
    let spectrum = new RGBSpectrum(300).colors;
    let delay = 400; //ms

    return new EmberPromise((resolve)=> {
      setTimeout(()=> {
        let recordOffset = pageOffset * pageSize;
        resolve(spectrum.slice(recordOffset, recordOffset + pageSize));
      }, delay);
    });
  },

  initialReadOffset: 0,
  pageSize: 10,

  actions: {
    initializeReadOffset(dataset) {
      let initReadOffset = this.get('initialReadOffset');
      dataset.setReadOffset(initReadOffset);
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
