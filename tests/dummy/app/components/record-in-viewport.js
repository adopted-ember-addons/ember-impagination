import Ember from 'ember';
import InViewportMixin from 'ember-in-viewport';

export default Ember.Component.extend(InViewportMixin, {
  dataset: null,
  pageIndex: null,
  size: null,

  didEnterViewport() {
    let dataset = this.get('dataset');
    dataset.setReadOffset(this.get('pageIndex') * this.get('size'));
  }
});
