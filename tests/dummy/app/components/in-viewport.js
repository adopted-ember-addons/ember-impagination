import Ember from 'ember';
import InViewportMixin from 'ember-in-viewport';

export default Ember.Component.extend(InViewportMixin, {
  classNames: ['viewport'],

  didEnterViewport() {
    console.log('didEnterViewport');
    this.sendAction('did-enter');
  },

  didExitViewport() {
    console.log('didExitViewport');
  },

  viewportOptionsOverride: Ember.on('didInsertElement', function() {
    // Spying on scrolling behavior is opt-in
    this.set('viewportSpy', true);
  })
});
