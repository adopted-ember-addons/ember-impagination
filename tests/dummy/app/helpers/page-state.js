import { helper } from '@ember/component/helper';

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

export default helper(pageState);
