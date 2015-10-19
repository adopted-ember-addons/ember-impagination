class Record {
  constructor(page, content, index) {
    this.page = page;
    this.content = content;
    this.index = index;
  }
  get isRequested() { return this.page.isRequested; }
  get isPending() { return this.page.isPending; }
  get isResolved() { return this.page.isResolved; }
  get isRejected() { return this.page.isRejected; }
}

export default Record;
