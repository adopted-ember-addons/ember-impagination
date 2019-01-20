import Component from '@ember/component';
import InViewportMixin from 'ember-in-viewport';
import { tryInvoke }  from '@ember/utils';

export default Component.extend(InViewportMixin, {
  classNames: ['viewport'],

  didEnterViewport() {
    tryInvoke(this, 'did-enter');
  },
  didInsertElement() {
    // Spying on scrolling behavior is opt-in
    this.set('viewportSpy', true);
  }
});
