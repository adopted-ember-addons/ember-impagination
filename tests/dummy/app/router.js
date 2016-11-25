import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('intro', { path: '/'});
  this.route('index', { path: '/color-demo'});
  this.route('impagination-dataset-tips');
});

export default Router;
