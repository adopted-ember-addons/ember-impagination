'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = function() {
  return Promise.all([
    getChannelURL('release'),
    getChannelURL('beta'),
    getChannelURL('canary')
  ]).then((urls) => {
    return {
      useYarn: true,
      scenarios: [
        {
          name: 'ember-lts-2.16',
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({ 'jquery-integration': true }),
          },
          bower: {
            dependencies: {
              ember: null,
              'ember-cli-shims': null,
              'ember-data': null,
            },
          },
          npm: {
            devDependencies: {
              '@ember/jquery': '^0.5.2',
              'ember-source': '~2.16.0'
            }
          }
        },
        {
          name: 'ember-lts-2.18',
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({ 'jquery-integration': true }),
          },
          bower: {
            dependencies: {
              ember: null,
              'ember-cli-shims': null,
              'ember-data': null,
            },
          },
          npm: {
            devDependencies: {
              '@ember/jquery': '^0.5.2',
              'ember-source': '~2.18.0'
            }
          }
        },
        {
          name: 'ember-release',
          bower: {
            dependencies: {
              ember: null,
              'ember-cli-shims': null,
              'ember-data': null,
            },
          },
          npm: {
            devDependencies: {
              'ember-source': urls[0]
            }
          }
        },
        {
          name: 'ember-beta',
          bower: {
            dependencies: {
              ember: null,
              'ember-cli-shims': null,
              'ember-data': null,
            },
          },
          npm: {
            devDependencies: {
              'ember-source': urls[1]
            }
          }
        },
        {
          name: 'ember-canary',
          bower: {
            dependencies: {
              ember: null,
              'ember-cli-shims': null,
              'ember-data': null,
            },
          },
          npm: {
            devDependencies: {
              'ember-source': urls[2]
            }
          }
        },
        {
          name: 'ember-default',
          npm: {
            devDependencies: {}
          }
        },
        {
          name: 'ember-default-with-jquery',
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({
              'jquery-integration': true
            })
          },
          bower: {
            dependencies: {
              ember: null,
              'ember-cli-shims': null,
              'ember-data': null,
            },
          },
          npm: {
            devDependencies: {
              '@ember/jquery': '^0.5.2'
            }
          }
        }
      ]
    };
  });
};
