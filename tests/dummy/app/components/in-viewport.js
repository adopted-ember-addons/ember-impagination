import Ember from 'ember';
import InViewportMixin from 'ember-in-viewport';

export default Ember.Component.extend(InViewportMixin, {
  classNames: ['viewport'],

  didEnterViewport() {
    this.sendAction('did-enter');
  },

  viewportOptionsOverride: Ember.on('didInsertElement', function() {
    // Spying on scrolling behavior is opt-in
    this.set('viewportSpy', true);
  })
});
