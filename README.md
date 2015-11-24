# Ember-impagination
[![Build Status](https://travis-ci.org/thefrontside/ember-impagination.svg)](https://travis-ci.org/thefrontside/ember-impagination)

[Impagination](https://github.com/flexyford/impagination) implementation for Ember.

## Demo
[Ember-Impagination Demo](http://thefrontside.github.io/ember-impagination/index)

The color-demo presents a finite scroll implementation of ember-impagination. 
We scroll through the ROYGBIV color spectrum by loading and unloading pages of records, where each record is a unique color-hue. Resolved (Loaded) Pages are green, Pending (Loading) pages are white. Unrequested (Unloaded) pages are black.

![](http://g.recordit.co/iltQTaYwSb.gif)

The demo is implemented using [{{virtual-each}}](https://github.com/jasonmit/virtual-each), although you will find an [{{ember-collection}}](https://github.com/emberjs/ember-collection) implementation in the dummy application as well. *virtual-each* is the recommend ember-scroll-component for *ember-impagination*.

## Installation

* `ember install ember-impagination`

## Usage

To create an `impagination-dataset` there are two required parameters, `fetch` and `page-size`. See [Impagination](https://github.com/flexyford/impagination) for further attribute descriptions.

```javascript
// app/route/record.js
export default Ember.Route.extend({
  pageSize: 5,       // fetch in pages of 5 (*required*)
  readOffset: 0,     // the current index of the dataset. load/unloadHorizons extend from this index.
  loadHorizon: 10,   // fetch records "within" this range from the readOffset (default: pageSize)
  unloadHorizon: 10, // unload records which are "outside" this range from the readOffset (default: Infinity)
   

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

Once we have setup our attributes we can invoke them in the template.

```hbs
{{!-- app/templates/index.hbs --}}
{{#impagination-dataset 
  fetch=fetch 
  page-size=pageSize 
  load-horizon=loadHorizon 
  unload-horizon=unloadHorizon 
  read-offset=readOffset 
  as |records|}}
  <div class="records">Total Records: {{records.length}}</div>
  {{#each records as |record|}}
    <div class="record">Record {{record.id}}</div>
  {{/each}}
{{/impagination-dataset}}
```

Immediately, this will call fetch twice (for records 0-4, and 5-9)
```
Total Records: 10
Record 0
Record 1
Record 2
...
Record 9
```

## Running Tests

* `ember test`
* `ember test --server`
