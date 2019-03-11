# Ember-Impagination

[![npm version](https://badge.fury.io/js/ember-impagination.svg)](https://badge.fury.io/js/ember-impagination)
[![Ember Observer Score](http://emberobserver.com/badges/ember-impagination.svg)](http://emberobserver.com/addons/ember-impagination)
[![Build Status](https://travis-ci.org/thefrontside/ember-impagination.svg?branch=master)](https://travis-ci.org/thefrontside/ember-impagination)

*Ember-Impagination* is an Ember binding for
[Impagination](https://github.com/flexyford/impagination), a front-end
data-layer for the paginated API on your server. *Ember-Impagination*
leverages the power of Glimmer and provides your component the data it
needs to render quickly each and every time.

> Impagination README:
> Whatever your use-case: infinite scrolling lists, a carousel
> browser, or even a classic page-by-page result list, Impagination
> frees you to focus on what you want to do with your data, not the
> micro-logistics of when to fetch it. All you provide Impagination is
> the logic to fetch a single page, plus how many pages you want it to
> pre-fetch ahead of you, and it will figure out the rest.
> Impagination is built using an event-driven immutable style, so it
> is ideal for use with UI frameworks like Ember . . .

Hence, we present *Ember-Impagination*.

*Ember-Impagination* provides you with a component,
`{{impagination-dataset as |data|}}`, you can use to feed data into
your templates while having that data look exactly like an
`Ember.Array`.

> Note: *Ember-Impagination* does not provide any of the visual
> elements in a system like infinite scroll. You'll still need to use
> a special component like `virtual-each` or
> `ember-collection`. Instead, *Ember-Impagination* simplifies feeding
> your components fetched data.

## Installation

* `ember install ember-impagination`

## Demo

[Ember-Impagination Demo](https://adopted-ember-addons.github.io/ember-impagination/)

The demo presents a finite scroll implementation of
*Ember-Impagination*. It scrolls through the ROYGBIV color spectrum by
loading and unloading pages of records, where each record is a unique
color-hue. At the top of the demo, you will find a visualization for
pages. Resolved (Loaded) Pages are green, Pending (Loading) pages are
white, and Unrequested (Unloaded) pages are black. The white-bar
represents the top-most index of the scroll view.

![ember-impagination](http://g.recordit.co/iltQTaYwSb.gif)

The demo is implemented using
[virtual-each](https://github.com/jasonmit/virtual-each) due to the
simplicity of the component. However, *Ember-Impagination* can also be
utilized with other components like
[ember-collection](https://github.com/emberjs/ember-collection), or
even a simple `{{each}}`. By design, *Ember-Impagination* leverages
Glimmer and yields paginated data from your server's API to components
which expect an array.

## Usage

### Impagination-Dataset Component

To create an `impagination-dataset` there are two *required*
parameters, `fetch` and `page-size`. Optional parameters include
`load-horizon`, `unload-horizon`, `unfetch`. See
[Impagination](https://github.com/flexyford/impagination) for detailed
attribute descriptions.

```hbs
{{!-- app/templates/index.hbs --}}
{{#impagination-dataset
  fetch=fetch
  page-size=pageSize
  load-horizon=loadHorizon
  as |records|}}
  <div class="records">Total Records: {{records.length}}</div>
  {{#each records as |record|}}
    <div class="record">Record {{record.content.id}}</div>
  {{/each}}
{{/impagination-dataset}}
```

Now, in your route, you can define the actual `(un)fetch` functions
that tell `{{impagination-dataset}}` how it should request each
individual page, and the `(un)loadHorizon` which specify how many
pages to request ahead/behind.

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
      let meta = data.get('meta');
      stats.totalPages = meta.totalPages;
      return data.toArray();
    });
  },
  // unfetch() function is invoked whenever a page is unloaded
  unfetch: function(records, pageOffset) {
    this.store.findByIds('record', records.map(r => r.id).then(function(records) {
      records.forEach(record => record.deleteRecord());
    }));
  }
})
```

This setup will immediatly call fetch twice (for records 0-4 [page 0]
and records 5-9 [page 1])

```text

Total Records: 10
Record 0
Record 1
Record 2
...
Record 9
```

#### Passing the Fetch Function

In **Ember 1.13 and above**, we can use closure-actions to pass the
fetch function into `ember-impagination`

```handlebars
{{#impagination-dataset fetch=(action "fetch")}}
```

```javascript
// app/route/record.js
export default Ember.Route.extend({

  // fetch() function is invoked whenever a page is requested within the loadHorizon
  actions: {
    fetch(pageOffset, pageSize, stats) { // function which returns a "thenable" (*required*)
      let params = {
        query: query,
      };
      // fetch a page of records at the pageOffset
      return this.store.query('record', params).then((data) => {
        let meta = data.get('meta');
        stats.totalPages = meta.totalPages;
        return data.toArray();
      });
    }
  }
});
```

> We do not recommend defining `fetch` inside your controller because
> it requires
> [injecting the store into the controller](https://github.com/thefrontside/ember-impagination/issues/39#issuecomment-172101680)

In **Ember 1.12 and below** we cannot define `fetch` in our actions
hash. We must instead bind it to our controller.
```handlebars
{{#impagination-dataset fetch=fetch)}}
```

```javascript
// app/route/record.js
export default Ember.Route.extend({
    fetch: function(pageOffset, pageSize, stats) {
      return this.store.query(...);
    },
    setupController: function(controller, model){
      this._super.apply(this, arguments);
      controller.set('fetch', this.fetch.bind(this));
    }
});
```

### Filtering Records

We fetch records using an immutable style, but we often require
filtering by mutable records in our dataset. To enable filtering, pass
a filter `callback` to `ember-impagination` as you would to
`Array.prototype.filter()`. The filters are applied as soon as a page
is resolved. To filter a page at other times in your application see
[`refilter`](#dataset-actions).

```handlebars
{{#impagination-dataset fetch=(action "fetch") filter=filterCallback}}
```

```javascript
// app/route/record.js
export default Ember.Route.extend({

  // filter() function is invoked whenever a page is resolved or refiltered
  filterCallback(record/*, index, records*/) { // function which rejects deleted records
    return !record.get('isDeleted');
  }
});
```

### Dataset API

There are a number actions to update the dataset.

#### Updating the Dataset

| Actions       |    Parameters    | Description                                                                                                    |
| ------------- | :--------------: | :------------------------------------------------------------------------------------------------------------- |
| refilter      | [filterCallback] | Reapplies the filter for all resolved pages. If `filterCallback` is provided, applies and sets the new filter. |
| reset         |     [offset]     | Unfetches all pages and clears the `state`. If `offset` is provided, fetches records starting at `offset`.     |
| setReadOffset |     [offset]     | Sets the `readOffset` and fetches records resuming at `offset`                                                 |
| ~~reload~~    |   ~~[index]~~    | _Removed in `1.0.0` release. Please use `reset` instead._                                                      |

#### Updating the State

| Actions | Parameters  | Defaults                 | Description                            |
| ------- | :---------: | :----------------------- | :------------------------------------- |
| post    | data, index | index = 0                | Creates record with `data` at `index`. |
| put     | data, index | index = state.readOffset | Merges `data` into record at `index`.  |
| delete  |    index    | index= state.readOffset  | Deletes record at `index`.             |

These functions can be called from the route/controller or from child
components in the handlebars templates. In the examples below, we
`reset` the dataset upon search queries through the {{search-pane}}
component using both options.

#### resetting from the parent route

In order to call dataset actions from the route, we will have to
observe the latest dataset and dataset-actions with the `on-observe`
parameter.

```handlebars
{{#search-pane search=(action "search")}}
  {{#impagination-dataset on-observe=(action "observeDataset") fetch=(action "fetch") as |dataset|}}
    {{#ember-collection items=dataset as |record|}}
      {{chat-search-result result=record}}
    {{/ember-collection}}
  {{/impagination-dataset}}
{{/search-pane}}
```

``` javascript
_resetDataset() {
  this.get('dataset').reset();
},

actions: {
  observeDataset: function(dataset) {
    this.set('dataset', dataset);
  },
  search(query) {
    this.set('searchParams', query);
    this._resetDataset();
  },
  fetch(pageOffset, pageSize, stats) {
    params = this.get('params');
    return this.store.query('records', params);
  }
}
```

#### resetting from child components

Here we do not need to utilize `impagination-dataset`'s `on-observe`
parameter. The `reset` action is simply called by a child component.

```handlebars
{{#impagination-dataset fetch=(action "fetch") as |dataset|}}
  {{!-- reset dataset and start fetching at record index 0 --}}
  {{#search-pane search=(action "search") on-search-results=(action dataset.reset 0)}}
      {{#ember-collection items=dataset as |record|}}
        {{chat-search-result result=record}}
      {{/ember-collection}}
  {{/search-pane}}
{{/impagination-dataset}}
```

### Create your own Dataset

If `{{impagination-dataset}}` is not an ideal component for your
unique `Impagination` needs, you can get into the nitty gritty, and
use `Impagination` directly. If you find yourself creating your own
`Dataset`, let us know how you are using `Dataset` and
`Impagination`. It may be a reason for improvements or another ember
addon.

```js
import Dataset from 'impagination/dataset';

let dataset = new Dataset({
  pageSize: 5,
  fetch: function(pageOffset, pageSize, stats) {
    return new Ember.RSVP.Promise((resolve)=> {
      let data = // Array
      resolve(data);
    },

    return this.store.query('record', params).then((data) => {
      let meta = result.get('meta');
      stats.totalPages = meta.totalPages;
      return result.toArray();
    });
  },
  observe: (state) => {}
});
```

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

### Code of Conduct

Please note that this project is released with a Contributor Code of
Conduct. By participating in this project you agree to abide by its
terms, which can be found in the `CODE_OF_CONDUCT.md` file in this
repository.

### License

------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
