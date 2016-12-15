import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('index', { path: '/'});
  this.route('load-more');
  this.route('auto-load-more');
  this.route('virtual-each');
  this.route('ember-collection');
});

export default Router;
