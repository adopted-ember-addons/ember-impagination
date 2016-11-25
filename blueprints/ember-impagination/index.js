/*jshint node:true*/
module.exports = {
  description: 'Installation blueprint for ember-impagination',
  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addAddonsToProject({
      packages: [
        {name: 'ember-browserify', target: '^1.1.13'},
      ]
    }).then(function() {
      return this.addPackagesToProject([
        {name: 'impagination', target: "^1.0.0-alpha.2"}
      ]);
    }.bind(this));
  }
};
