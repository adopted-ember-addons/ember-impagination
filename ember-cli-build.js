/* global require, module */
/* eslint-env node */
const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    // Add options here
    'ember-cli-babel': {
      includePolyfill: true
    },
    'ember-cli-bootswatch': {
      'theme': 'default'
    },
    snippetPaths: ['tests/dummy/snippets'],
    snippetSearchPaths: ['tests/dummy/app']
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  app.import('bower_components/bootswatch/paper/bootstrap.min.css');

  return app.toTree();
};
