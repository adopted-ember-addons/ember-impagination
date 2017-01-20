/*jshint node:true*/
/* global require, module */
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    // Add options here
    babel: {
      includePolyfill: true
    },
    'ember-cli-bootswatch': {
      'theme': 'default'
    },
    // WARN: Phantom2.1 fails with @media queries.
    // https://github.com/ariya/phantomjs/issues/14173#issuecomment-212663559
    // 'ember-cli-bootswatch': 'paper',
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
