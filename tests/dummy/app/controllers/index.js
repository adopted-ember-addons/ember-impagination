import Ember from 'ember';

export default Ember.Controller.extend({
  fetch: function (pageOffset, pageSize, stats) {
    let spectrum = new RGBSpectrum(200).colors;
    let delay = 1000; //ms
    return new Ember.RSVP.Promise((resolve)=> {
      setTimeout(()=> {
        stats.totalPages =  Math.ceil( spectrum.length / pageSize);
        let recordOffset = pageOffset * pageSize;
        resolve(spectrum.slice(recordOffset, recordOffset + pageSize));
      }, delay);
    });
  },
  initialReadOffset: 0,
  loadHorizon: 1,
  unloadHorizon: 2,
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
