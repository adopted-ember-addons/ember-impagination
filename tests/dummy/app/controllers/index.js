import Ember from 'ember';

export default Ember.Controller.extend({
  // colorCount: 1000,
  fetch: function (pageOffset, stats) {
    let spectrum = new RGBSpectrum(1000).colors;
    let delay = 50; //ms
    return new Ember.RSVP.Promise((resolve)=> {
      let pageSize = 10;
      setTimeout(()=> {
        stats.totalPages =  Math.ceil( spectrum.length / pageSize);
        let recordOffset = pageOffset * pageSize;
        console.log(`resolved records at page ${pageOffset} = `, spectrum.slice(recordOffset, recordOffset + pageSize));
        resolve(spectrum.slice(recordOffset, recordOffset + pageSize));
      }, delay);
    });
  },
  initialReadOffset: 0,
  loadHorizon: 2,
  unloadHorizon: Infinity,
  pageSize: 10
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
