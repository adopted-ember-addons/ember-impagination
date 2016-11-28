import Ember from 'ember';

export default Ember.Controller.extend({
  toc: [
    {
      name: 'Introduction',
      route: 'intro'
    },
    {
      name: 'impagination-dataset component',
      route: 'impagination-dataset-tips'
    },
    {
      name: 'Load More Button',
      route: 'load-more'
    },
    {
      name: 'Infinite Scroll: Ember In-Viewport',
      route: 'auto-load-more'
    },
    {
      name: 'Infinite Scroll: Virtual Each',
      route: 'virtual-each'
    },
    {
      name: 'Infinite Scroll: Ember Collection',
      route: 'ember-collection'
    },
    {
      name: 'Color Demo',
      route: 'index'
    }
  ]
});
