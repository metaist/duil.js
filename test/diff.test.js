import test from 'tape'
import {diff, merge} from '../src/diff';

test('diff: no change', (t) => {
  let a, b, delta = null;

  a = '', b = '';
  t.same(diff(a, b), delta, 'expect no change for empty strings');

  a = [], b = [];
  t.same(diff(a, b), delta, 'expect no change for empty arrays');

  a = {}, b = {};
  t.same(diff(a, b), delta, 'expect no change for empty objects');

  a = 'abc', b = 'abc';
  t.same(diff(a, b), delta, 'expect no change for same strings');

  a = [1, 2, 3];
  b = [1, 2, 3];
  t.same(diff(a, b), delta, 'expect no change for same arrays');

  a = {a: 1, b: 2, c: 3};
  b = {c: 3, b: 2, a: 1};
  t.same(diff(a, b), delta, 'expect no change for same objects');

  a = [[]];
  b = [[]];
  t.same(diff(a, b), delta, 'expect no change for nested array');

  a = {a: {}};
  b = {a: {}};
  t.same(diff(a, b), delta, 'expect no change for nested object');

  t.end();
});

test('diff: add', (t) => {
  let a, b, delta;

  a = '', b = 'a';
  delta = ['', 'a'];
  t.same(diff(a, b), delta, 'append letter to string');

  a = [], b = [1];
  delta = {0: [undefined, 1]};
  t.same(diff(a, b), delta, 'append one item to array');

  a = {}, b = {a: 1};
  delta = {a: [undefined, 1]};
  t.same(diff(a, b), delta, 'set one property on object');

  a = [1, 2, 3];
  b = [1, 2, 3, 4, 5];
  delta = {
    3: [undefined, 4],
    4: [undefined, 5]
  };
  t.same(diff(a, b), delta, 'append multiple to array');

  a = {a: 1, b: 2, c: 3};
  b = {a: 1, b: 2, c: 3, d: 4, e: 5};
  delta = {
    d: [undefined, 4],
    e: [undefined, 5]
  };
  t.same(diff(a, b), delta, 'set multiple properties on object');

  t.end();
});

test('diff: remove', (t) => {
  let a, b, delta;

  a = 'ab', b = 'a';
  delta = [a, b];
  t.same(diff(a, b), delta, 'remove one letter from string');

  a = [1, 2];
  b = [1];
  delta = {1: [2, undefined]};
  t.same(diff(a, b), delta, 'remove one item from array');

  a = {a: 1, b: 2};
  b = {a: 1};
  delta = {b: [2, undefined]};
  t.same(diff(a, b), delta, 'remove one property from object');

  a = [1, 2, 3];
  b = [1];
  delta = {
    1: [2, undefined],
    2: [3, undefined]
  };
  t.same(diff(a, b), delta, 'remove multiple items from array');

  a = {a: 1, b: 2, c: 3};
  b = {a: 1};
  delta = {
    b: [2, undefined],
    c: [3, undefined]
  }
  t.same(diff(a, b), delta, 'remove multiple properties from object');

  // note: removals from the start are registered as updates
  a = [1, 2, 3];
  b = [2, 3];
  delta = {
    0: [1, 2],
    1: [2, 3],
    2: [3, undefined]
  };
  t.same(diff(a, b), delta, 'remove item from start of array');

  // note: removals from the middle are registered as updates
  a = {data: [
    {id: 1, x: 10, y: 10, selected: false},
    {id: 2, x: 20, y: 20, selected: false},
    {id: 3, x: 100, y: 50, selected: false},
    {id: 4, x: 60, y: 60, selected: false}
  ]};
  b = {data: a.data.slice(1, 3)};
  delta = {
    'data.0.id': [1, 2],
    'data.0.x': [10, 20],
    'data.0.y': [10, 20],
    'data.1.id': [2, 3],
    'data.1.x': [20, 100],
    'data.1.y': [20, 50],
    'data.2': [a.data[2], undefined],
    'data.3': [a.data[3], undefined]
  };
  t.same(diff(a, b), delta, 'remove items from middle of array');

  t.end();
});

test('diff: update', (t) => {
  let a, b, delta;

  a = {a: 1, b: 2};
  b = {a: 1, b: 3};
  delta = {b: [2, 3]};
  t.same(diff(a, b), delta, 'update one property in object');

  a = [1, 2];
  b = [1, 3];
  delta = {1: [2, 3]};
  t.same(diff(a, b), delta, 'update one item in array');

  a = {a: 1, b: 2, c: 3};
  b = {a: 1, b: 4, c: 5};
  delta = {
    b: [2, 4],
    c: [3, 5]
  };
  t.same(diff(a, b), delta, 'update multiple properties in object');

  a = [1, 2, 3];
  b = [1, 4, 5];
  delta = {
    1: [2, 4],
    2: [3, 5]
  };
  t.same(diff(a, b), delta, 'update multiple items in array');

  a = {property: {value: 1}};
  b = {property: {value: 2}};
  delta = {'property.value': [1, 2]};
  t.same(diff(a, b), delta, 'change simple nested object');

  a = {data: [{x: 1}, {x: 2}, {x: 3}], func: function (item) { return item.x}};
  b = {data: [{x: a.func(a.data[0])}, {x: 5}], func: a.func};
  delta = {
    'data.1.x': [2, 5],
    'data.2': [{x: 3}, undefined]
  };
  t.same(diff(a, b), delta, 'change nested object');

  t.end();
});

test('diff: values', (t) => {
  let x, a, b, delta;

  a = 42, b = 52;
  delta = {'property.value': [42, 52]};
  t.same(diff(a, b, 'property.value'), delta, 'check simple value');

  a = new Date('2000-01-01');
  b = new Date('2000-01-02');
  delta = [a, b];
  t.same(diff(a, b), delta, 'different dates');

  a = new Date('2000-01-01');
  b = new Date('2000-01-01');
  delta = null;
  t.same(diff(a, b), delta, 'same dates');

  x = {a: 1};
  a = [x, x];
  b = [x, x, x];
  delta = {2: [undefined, x]};
  t.same(diff(a, b), delta, 'non-cycle repeated object');

  a = {x: 1, y: {}};
  a.y.z = a.y;
  b = {x: 2, y: {}};
  b.y.z = b.y;
  delta = {x: [1, 2], 'y.z': [undefined, b.y]};
  t.same(diff(a, b), delta, 'cycle detected');

  a = {a: 1}, b = {a: 1, b: undefined};
  delta = null;
  t.same(diff(a, b), delta, 'new undefined property is not added');

  a = {a: 1, b: 2}, b = {a: undefined, b: 2};
  delta = {a: [1, undefined]};
  t.same(diff(a, b), delta, 'old property set to undefined removed');

  t.end();
});

test('diff: merge', (t) => {
  const d = {
    // normal
    'create': {x: [undefined, 42]},
    'remove': {x: [52, undefined]},
    'update': {x: [62, 72]},

    // weird, but legal
    'null': null,
    'delete': {x: undefined},
    'cancel': {x: [undefined, undefined]},

    // illegal empty values that will be treated like "null"
    '""': '',
    '[]': [],
    '{}': {},
    '0': 0,
    'false': false,
    'NaN': NaN,
    'undefined': undefined
  };

  const normal = [d.create, d.remove, d.update];
  const weird = [d.null, d.delete, d.cancel,
                 d['""'], d["[]"], d['{}'], d['0'],
                 d.false, d.NaN, d.undefined];

  const name = v => {
    const items = Object.entries(d);
    for(let i = 0; i < items.length; i++) {
      const [key, val] = items[i];
      if (v === val || Number.isNaN(v) && Number.isNaN(val)) { return key; }
    }
    return JSON.stringify(v);
  };

  const test_merge = (a, b, delta, comment) => {
    t.same(merge(a, b), delta, comment ||
      `expect ${name(a)} + ${name(b)} = ${name(delta)}`);
  };

  // normal + normal = normal
  normal.forEach(x => {
    normal.forEach(y => {
      let delta = {x: [x.x[0], y.x[1]]};
      if (x === d.create && y === d.remove) { delta = null; }
      test_merge(x, y, delta);
    });
  });

  // weird + weird = null
  weird.forEach(x => {
    weird.forEach(y => {
      test_merge(x, y, null);
    });
  });

  // weird + normal = normal
  // normal + weird = normal
  weird.forEach(nop => {
    normal.forEach(x => {
      test_merge(nop, x, x);
      test_merge(x, nop, x);
    });
  });

  t.end();
});
