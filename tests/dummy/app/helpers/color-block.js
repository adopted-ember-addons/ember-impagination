import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function colorBlock(color) {
  return htmlSafe(`background-color: ${color}; width: 600px; height: 70px`);
}

export default helper(colorBlock);
