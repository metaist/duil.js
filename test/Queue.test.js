import test from 'tape';
import Queue from '../src/Queue';

test('Queue', (t) => {
  const items = [1, 2, 3];
  const q = new Queue(items);

  t.is(q.length, items.length, 'expect same number of items');
  t.same(q.queue, items, 'expect items to be in queue');
  t.same(q.peek(), items[0], 'expect first item');
  t.same(q.get(), items[0], 'expect first item');
  t.is(items.length, 3, 'expect items to remain unchanged');

  q.set([]);
  t.is(q.length, 0, 'expect queue to be empty');
  t.is(q.peek(), undefined, 'no first item');
  t.is(q.get(), undefined, 'no items');

  q.add(4);
  t.is(q.length, 1, 'expect item to be added');
  t.is(q.peek(), 4, 'expect first item');
  t.is(q.get(), 4, 'expect item removed');
  t.is(q.length, 0, 'expect empty queue');

  t.end();
});
