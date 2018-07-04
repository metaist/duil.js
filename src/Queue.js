
/**
  Fast queue based on [infloop/queue.js][1].

  [1]: https://gist.github.com/infloop/8469659
 */
class Queue {

  /**
    Initialize the queue and offset.
    @param {Array} [items=[]] The initial items in the queue.
  */
  constructor (items) {
    this.queue = [];
    this.set(items || []);
  }

  /**
    Get the length of the queue.
    @returns {Number} Returns the number of items in the queue.
  */
  get length() { return this.queue.length - this.offset; }

  /**
    Return true if the queue is empty, false otherwise.
    @returns {Boolean} Returns true, if the queue is empty, false otherwise.
  */
  isEmpty() { return 0 === this.queue.length; }

  /**
    Add an item to the queue.

    @param {...*} items The items to add to the queue.
    @returns {Queue} Returns the Queue itself for chaining.
  */
  add(...items) {
    this.queue.push(...items);
    return this;
  }

  /**
    Return the item at the front of the queue without dequeuing it.
    @returns {*} The item at the front of the queue or `undefined` if the queue
      is empty.
  */
  peek() {
    return this.queue.length > 0 ? this.queue[this.offset] : undefined;
  }

  /**
    Return the item at the front of the queue.
    @returns {*} The item at the front of the queue or `undefined` if it is
      empty.
  */
  get() {
    if (0 === this.queue.length) { return undefined; }

    const item = this.queue[this.offset];
    // eslint-disable-next-line no-plusplus
    if (++this.offset * 2 >= this.queue.length) {
      this.queue = this.queue.slice(this.offset);
      this.offset = 0;
    }// end if: advance offset and clear memory, if needed

    return item;
  }

  /**
    Replace the queue with a different set of items.
    @param {Array} items The new array of items.
    @return {Queue} Returns the queue itself for chaining.
    */

  set(items) {
    this.queue.splice(0, this.queue.length, ...items);
    this.offset = 0;
    return this;
  }
}

export default Queue;
