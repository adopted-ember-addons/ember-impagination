import Ember from 'ember';

export function colorBlock(color) {
  return Ember.String.htmlSafe("background-color:"+ color +"; width:600px; height:70px");
}

export default Ember.Helper.helper(colorBlock);
