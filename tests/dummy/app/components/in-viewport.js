import { on } from '@ember/object/evented';
import Component from '@ember/component';
import InViewportMixin from 'ember-in-viewport';

export default Component.extend(InViewportMixin, {
  classNames: ['viewport'],

  didEnterViewport() {
    this.sendAction('did-enter');
  },

  viewportOptionsOverride: on('didInsertElement', function() {
    // Spying on scrolling behavior is opt-in
    this.set('viewportSpy', true);
  })
});
