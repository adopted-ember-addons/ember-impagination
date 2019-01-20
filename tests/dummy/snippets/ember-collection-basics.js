import Controller from '@ember/controller';
import { task, timeout } from 'ember-concurrency';

export default Controller.extend({
  fetch: function(pageOffset, pageSize, stats) {
    return $.ajax({ url: `/colors?page=pageOffset` }).then((response) => {
      stats.totalPages = response.meta.total_pages;
      return response.colors;
    });
  },

  'timeout-ms': 5,

  setReadOffset: task(function * (dataset, offset) {
    yield timeout(this.get('timeout-ms'));
    console.log('setReadOffset', offset);
    dataset.setReadOffset(offset);
  }).restartable(),

  actions: {
    onObjectAt(dataset, index) {
      this.get('setReadOffset').perform(dataset, index);
    }
  }
});
