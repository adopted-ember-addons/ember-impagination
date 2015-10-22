import Ember from 'ember';

export default Ember.Object.extend({
  isRequested: null,
  isPending: null,
  isResolved: null,
  isRejected: null,
  isSettled: null,
  offset: null,
  size: null,
  readOffset: null,
  loadHorizon: null,
  unloadHorizon: null,
  totalPages: null,
  isCurrentPage: Ember.computed(function(){}),
  isLoadMin: Ember.computed(function(){}),
  isLoadMax: Ember.computed(function(){}),
  isUnloadMin: Ember.computed(function(){}),
  isUnloadMax: Ember.computed(function(){}),
});
