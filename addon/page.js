import Record from './record';

class UnrequestedPage {
  constructor(offset, size) {
    this.offset = offset;
    this.size = size || 0;
    this.data = new Array(size).fill({});
  }


  get isRequested() { return (this.isSettled || this.isPending); }
  get isPending() { return false; }
  get isResolved() { return false; }
  get isRejected() { return false; }
  get isSettled() { return false; }

  get records() {
    var records = this.data.map(function (content, index) {
      return new Record(this, content, index);
    }, this);
    return records;
  }

  request() {
    return new PendingPage(this);
  }

  unload() {
    return this;
  }
}

class PendingPage extends UnrequestedPage {
  constructor(unrequested) {
    super(unrequested.offset, unrequested.size);
  }

  get isPending() { return true; }

  resolve(records) {
    return new ResolvedPage(this, records);
  }

  reject(error) {
    return new RejectedPage(this, error);
  }

  request() {
    return this;
  }

  unload() {
    return new UnrequestedPage(this.offset, this.size);
  }
}

class ResolvedPage extends PendingPage {
  constructor(pending, data) {
    super(pending);
    this.data = data;
  }
  get isPending() { return false; }
  get isResolved() { return true; }
  get isSettled() { return true; }
}

class RejectedPage extends PendingPage {
  constructor(pending, error) {
    super(pending);
    this.error = error;
  }

  get isPending() { return false; }
  get isRejected() { return true; }
  get isSettled() { return true; }
}

export default UnrequestedPage;
