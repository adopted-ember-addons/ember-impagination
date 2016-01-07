# Ember-Impagination
[![npm version](https://badge.fury.io/js/ember-impagination.svg)](https://badge.fury.io/js/ember-impagination)
[![Ember Observer Score](http://emberobserver.com/badges/ember-impagination.svg)](http://emberobserver.com/addons/ember-impagination)
[![Build Status](https://travis-ci.org/thefrontside/ember-impagination.svg)](https://travis-ci.org/thefrontside/ember-impagination)

*Ember-Impagination* is an Ember binding for [Impagination](https://github.com/flexyford/impagination), a front-end data-layer for the paginated API on your server. *Ember-Impagination* leverages the power of Glimmer and provides your component the data it needs to render quickly each and every time.
> Impagination README:

> Whatever your use-case: infinite scrolling lists, a carousel browser, or even a classic page-by-page result list, Impagination frees you to focus on what you want to do with your data, not the micro-logistics of when to fetch it. All you provide Impagination is the logic to fetch a single page, plus how many pages you want it to pre-fetch ahead of you, and it will figure out the rest.

> Impagination is built using an event-driven immutable style, so it is ideal for use with UI frameworks like Ember . . .

Hence, we present *Ember-Impagination*.

*Ember-Impagination* provides you with a component, `{{impagination-dataset as |data|}}`, you can use to feed data into your templates while having that data look exactly like an `Ember.Array`.

> Note: *Ember-Impagination* does not provide any of the visual elements in a system like infinite scroll. You'll still need to use a special component like `virtual-each` or `ember-collection`. Instead, *Ember-Impagination* simplifies feeding your components fetched data.

## Installation
* `ember install ember-impagination`

## Demo
[Ember-Impagination Demo](http://thefrontside.github.io/ember-impagination)

The demo presents a finite scroll implementation of *Ember-Impagination*. It scrolls through the ROYGBIV color spectrum by loading and unloading pages of records, where each record is a unique color-hue. At the top of the demo, you will find a visualization for pages. Resolved (Loaded) Pages are green, Pending (Loading) pages are white, and Unrequested (Unloaded) pages are black. The white-bar represents the top-most index of the scroll view.

![](http://g.recordit.co/iltQTaYwSb.gif)

The demo is implemented using [virtual-each](https://github.com/jasonmit/virtual-each) due to the simplicity of the component. However, *Ember-Impagination* can also be utilized with other components like [ember-collection](https://github.com/emberjs/ember-collection), or even a simple `{{each}}`. By design, *Ember-Impagination* leverages Glimmer and yields paginated data from your server's API to components which expect an array.

## Usage

### Impagination-Dataset Component

To create an `impagination-dataset` there are two *required* parameters, `fetch` and `page-size`. Optional parameters include `load-horizon`, `unload-horizon`, `read-offset`, `unfetch`. See [Impagination](https://github.com/flexyford/impagination) for detailed attribute descriptions.

```hbs
{{!-- app/templates/index.hbs --}}
{{#impagination-dataset
  fetch=fetch
  page-size=pageSize
  load-horizon=loadHorizon
  as |records|}}
  <div class="records">Total Records: {{records.length}}</div>
  {{#each records as |record|}}
    <div class="record">Record {{record.id}}</div>
  {{/each}}
{{/impagination-dataset}}
```

> In most cases, using a simple `{{each}}` would defeat the purpose of using a data layer like *Ember-Impagination*, and for truly infinite datasets might result in truly infinite loops :scream:

Now, in your route, you can define the actual `(un)fetch` functions that tell `{{impagination-dataset}}` how it should request each individual page, and the `(un)loadHorizon` which specify how many pages to request ahead/behind.

```javascript
// app/route/record.js
export default Ember.Route.extend({
  pageSize: 5,               // fetch records in pages of 5 (*required*)
  loadHorizon: 10,           // fetch  records "inclusive" (+/- loadHorizon)   of the current readOffset (default: pageSize)
  //unloadHorizon: Infinity, // unload records "exclusive" (+/- unloadHorizon) of the current readOffset (default: Infinity)
  //readOffset: 0,           // the initial readOffset of the dataset (default: 0)

  // fetch() function is invoked whenever a page is requested within the loadHorizon
  fetch: function(pageOffset, pageSize, stats) { // function which returns a "thenable" (*required*)
    let params = {
      page: pageOffset,
    };
    // fetch a page of records at the pageOffset
    return this.store.query('record', params).then((data) => {
      stats.totalPages = data.get('totalPages');
      return data.get('records');
    });
  },
  // unfetch() function is invoked whenever a page is unloaded
  unfetch: function(records, pageOffset) {
    this.store.findByIds('record', records.map((r)=>{return r.id})).then(function (records) {
      records.forEach((record)=>{
        record.deleteRecord();
      });
    });
  });
})
```

This setup will immediatly call fetch twice (for records 0-4 [page 0] and records 5-9 [page 1])
```
Total Records: 10
Record 0
Record 1
Record 2
...
Record 9
```
### Create your own Dataset
If `{{impagination-dataset}}` is not an ideal component for your unique `Impagination` needs, you can get into the nitty gritty, and use `Impagination` directly. If you find yourself creating your own `Dataset`, let us know how you are using `Dataset` and `Impagination`. It may be a reason for improvements or another ember addon.

```js
import Dataset from 'impagination/dataset';

let dataset = new Dataset({
  pageSize: 5,
  fetch: function(pageOffset, pageSize, stats) {
    return new Ember.RSVP.Promise((resolve)=> {
      let data = // Array
      resolve(data);
    });
    return this.store.query('record', params).then((data) => {
      stats.totalPages = data.get('totalPages');
      return data.get('records');
    });
  },
  observe: (state) => {}
});
```

## Running Tests

* `ember test`
* `ember test --server`


## Code of Conduct
Please note that this project is released with a Contributor Code of
Conduct. By participating in this project you agree to abide by its
terms, which can be found in the `CODE_OF_CONDUCT.md` file in this
repository.
