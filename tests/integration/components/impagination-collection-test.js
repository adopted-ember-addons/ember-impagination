/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'impagination-collection',
  'Integration: ImpaginationCollectionComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#impagination-collection}}
      //     template content
      //   {{/impagination-collection}}
      // `);

      this.render(hbs`{{impagination-collection}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
