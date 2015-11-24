# Ember-Impagination
[![Build Status](https://travis-ci.org/thefrontside/ember-impagination.svg)](https://travis-ci.org/thefrontside/ember-impagination)

[Impagination](https://github.com/flexyford/impagination) implementation for Ember.
> Whatever your use-case: infinite scrolling lists, a carousel browser, or even a classic page-by-page result list, Impagination frees you to focus on what you want to do with your data, not the micro-logistics of when to fetch it. All you provide Impagination is the logic to fetch a single page, plus how many pages you want it to pre-fetch ahead of you, and it will figure out the rest.

> Impagination is built using an event-driven immutable style, so it is ideal for use with UI frameworks like Ember . . .

Hence, we present *ember-impagination*

## Demo
[Ember-Impagination Demo](http://thefrontside.github.io/ember-impagination/index)

The demo presents a finite scroll implementation of ember-impagination. 

It scrolls through the ROYGBIV color spectrum by loading and unloading pages of records, where each record is a unique color-hue. 

At the top of the demo, you will find a visualization for pages. Resolved (Loaded) Pages are green, Pending (Loading) pages are white, and Unrequested (Unloaded) pages are black. The white-bar represents the top-most index of the scroll view.

![](http://g.recordit.co/iltQTaYwSb.gif)

The demo is implemented using [virtual-each](https://github.com/jasonmit/virtual-each) by default, although you will find an [ember-collection](https://github.com/emberjs/ember-collection) implementation in the dummy app as well. *virtual-each* is the recommend ember-scroll-component for *ember-impagination*.

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
