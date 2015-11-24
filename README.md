# Ember-impagination
[![Build Status](https://travis-ci.org/thefrontside/ember-impagination.svg)](https://travis-ci.org/thefrontside/ember-impagination)

[Impagination](https://github.com/flexyford/impagination) implementation for Ember.

## Demo
[Ember-Impagination Demo](https://github.com/thefrontside/ember-impagination/tree/color-demo)
The color-demo presents a finite scroll implementation of ember-impagination. Starting at RED, we scroll through all of the ROYGBIV color spectrum, fetching pages of colors dependent upon passed-in attributes. The color-demo contains implementations for [{{virtual-each}}](https://github.com/jasonmit/virtual-each) and [{{ember-collection}}](https://github.com/emberjs/ember-collection). *virtual-each* is the recommend ember-scroll-component for *ember-impagination*.

## Installation

* `ember install ember-impagination`

## Usage

To create an `impagination-dataset` there are two required parameters:
`fetch` and `page-size`

```javascript
// app/route/record.js
export default Ember.Route.extend({
  pageSize: 5,       // *required* fetch in pages of 5
  loadHorizon: 10,   // fetch records "within" this horizon (default: pageSize)
  unloadHorizon: 10, // unload records which are "outside" this horizon (default: Infinity)

  // fetch() function is invoked whenever a page is requested within the loadHorizon
  fetch: function(pageOffset, pageSize, stats) { // *required* function which returns a "thenable"
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
{#impagination-dataset 
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
