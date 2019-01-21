import { helper } from '@ember/component/helper';
import { isHTMLSafe, htmlSafe as _htmlSafe } from '@ember/string';

/* Taken from https://github.com/romulomachado/ember-cli-string-helpers */

export function htmlSafe([input]) {
  if (isHTMLSafe(input)) {
    input = input.string;
  }

  input = input || '';
  return _htmlSafe(input);
}

export default helper(htmlSafe);
