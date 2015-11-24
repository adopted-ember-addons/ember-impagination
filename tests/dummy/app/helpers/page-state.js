import Ember from 'ember';

export function pageState(params) {
  let page = params[0];
  if(page.isPending){
    return 'pending';
  } else if(page.isResolved){
    return 'resolved';
  } else if(page.isRejected){
    return 'rejected';
  } else {
    return 'unrequested';
  }
}

export default Ember.Helper.helper(pageState);
