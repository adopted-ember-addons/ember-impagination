import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    objectReadAt: function(offset) {
      this.dataset.setReadOffset(offset);
    }
  }
});
