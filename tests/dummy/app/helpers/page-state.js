import Ember from 'ember';

export function pageState(params) {
  let page = params[0];
  if(page.isPending){
    return 'pending flipInY';
  } else if(page.isResolved){
    return 'resolved flipOutY';
  } else if(page.isRejected){
    return 'rejected flipInY';
  } else {
    return 'unrequested flipOutY';
  }
}

export default Ember.Helper.helper(pageState);
