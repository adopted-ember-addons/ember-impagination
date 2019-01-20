import Controller from '@ember/controller';

export default Controller.extend({
  fetch: function(pageOffset, pageSize, stats) {
    return $.ajax({ url: `/colors?page=${pageOffset}` }).then((response) => {
      stats.totalPages = response.meta.total_pages;
      return response.colors;
    });
  },

  actions: {
    onSlice(dataset, start/*, end */) {
      dataset.setReadOffset(start);
    }
  }
});
