import Ember from 'ember';

export default Ember.Controller.extend({
  toc: [
    {
      name: 'Introduction',
      route: 'intro'
    },
    {
      name: 'The impagination-dataset helper',
      route: 'impagination-dataset-tips'
    },
    {
      name: 'Color Demo',
      route: 'index'
    }
  ]
});
