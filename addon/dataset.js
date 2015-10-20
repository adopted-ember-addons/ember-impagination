import Page from './page';

class State {
  constructor() {
    this.isPending = false;
    this.isResolved = true;
    this.isRejected = false;
    this.isSettled = true;
    this.pages = [];
    this.stats = {
      totalPages: undefined
    };
    this.totalSize = 0;
  }

  update(change) {
    let next = new State();
    next.isPending = this.isPending;
    next.isResolved = this.isResolved;
    next.isRejected = this.isRejected;
    next.isSettled = this.isSettled;
    next.totalSize = this.totalSize;
    next.pageSize = this.pageSize;
    next.pages = this.pages.slice();
    next.stats.totalPages = this.stats.totalPages;
    change.call(this, next);
    next.pages = Object.freeze(next.pages);
    return next;
  }

  get records() {
    return this.pages.reduce(function(records, page) {
      return records.concat(page.records);
    }, []);
  }
}

export default class Dataset {

  constructor(options = {}) {
    if (!options.pageSize) {
      throw new Error('created Dataset without pageSize');
    }
    if (!options.fetch) {
      throw new Error('created Dataset without fetch()');
    }

    this._pageSize = options.pageSize;
    this._fetch = options.fetch;
    this._observe = options.observe || function() {};
    this._loadHorizon = options.loadHorizon || 1;
    this._unloadHorizon = options.unloadHorizon || Infinity;
    this._initialReadOffset = options.initialReadOffset || 0;
    this.state = new State();
    this.state.pageSize = this._pageSize;
    this.setReadOffset(this._initialReadOffset); // Initial Page Fetch
  }

  setReadOffset(recordOffset) {
    let offset = Math.floor(recordOffset / this._pageSize);
    if (this._currentPageOffset === offset) { return; }
    this._currentPageOffset = offset;

    let state = this.state.update((next)=> {
      next.readOffset = offset;
      var pages = next.pages;

      var minLoadHorizon = Math.max(offset - this._loadHorizon, 0);
      var maxLoadHorizon = Math.min(next.stats.totalPages || Infinity, offset + this._loadHorizon);

      var minUnloadHorizon = Math.max(offset - this._unloadHorizon, 0);
      var maxUnloadHorizon = Math.min(next.stats.totalPages || Infinity, offset + this._unloadHorizon, pages.length);

      // Unload Pages outside the `unloadHorizons`
      for (i = 0; i < minUnloadHorizon; i += 1) {
        this._unloadPage(pages, i);
      }
      for (i = maxUnloadHorizon; i < pages.length; i += 1) {
        this._unloadPage(pages, i);
      }

      // Initialize Unfetched Pages between current Horizons
      let currentMinHorizon = Math.min(minUnloadHorizon, minLoadHorizon);
      let currentMaxHorizon = Math.max(maxUnloadHorizon, maxLoadHorizon);
      for (var i = currentMinHorizon; i < currentMaxHorizon; i += 1) {
        this._touchPage(pages, i);
      }

      // Request and Fetch Records within the `loadHorizons`
      for (i = minLoadHorizon; i < maxLoadHorizon; i += 1) {
        let page = this._touchPage(pages, i);

        if (!page.isRequested) {
          pages[i] = page.request();
          next.isPending = true;
          this._fetchPage(pages[i], i);
        }
      }
    });
    this._observe(this.state = state);
  }

  /* Unloads a page at the given index and returns the unloaded page */
  _unloadPage(pages, i) {
    let page = this._touchPage(pages, i);
    if (page.isRequested) {
      page = page.unload();
      pages.splice(i, 1, page);
    }
    return page;
  }

  /* Returns the page at the given index
   * If no page exists it generates and returns a new Page instance */
  _touchPage(pages, i) {
    var page = pages[i];
    if(!page) {
      page = new Page(i, this._pageSize);
      pages.splice(i, 1, page);
    }
    return page;
  }

  _getStateStats(pages) {
    return {
      totalPages: Math.max(pages.length, this._currentPageOffset + this._loadHorizon)
    };
  }

  _adjustTotalPages(pages, stats) {
    if(stats.totalPages > pages.length) {
      // touch pages
      for (let i = pages.length; i < stats.totalPages; i += 1) {
        this._touchPage(pages, i);
      }
    } else if(stats.totalPages < pages.length) {
      // remove pages
      pages.splice(stats.totalPages, pages.length);
    }
  }

  _fetchPage(page, offset) {
    let stats = {totalPages: this.state.totalPages };
    return this._fetch.call(this, offset, stats).then((records = []) => {
      let state = this.state.update((next)=> {
        next.isPending = false;
        next.stats = stats;
        if(page !== next.pages[offset]) { return; }
        next.pages[offset] = page.resolve(records);
        this._adjustTotalPages(next.pages, stats);
      });
      this._observe(this.state = state);
    }).catch((error = {}) => {
      let state = this.state.update((next)=> {
        next.isPending = false;
        next.stats = stats;
        if(page !== next.pages[offset]) { return; }
        next.pages[offset] = page.reject(error);
        this._adjustTotalPages(next.pages, stats);
      });
      this._observe(this.state = state);
    });
  }
}
