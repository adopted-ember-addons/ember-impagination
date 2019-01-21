import EmberObject, { computed } from '@ember/object';

export default EmberObject.extend({
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
  isCurrentPage: computed(function(){}),
  isLoadMin: computed(function(){}),
  isLoadMax: computed(function(){}),
  isUnloadMin: computed(function(){}),
  isUnloadMax: computed(function(){}),
});
