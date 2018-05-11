const test = require('tape');
const duil = require('../dist/duil');

const DUEL_MODEL = () => [
  {id: 1777, a: 'Button Gwinnett', b: 'Lachlan McIntosh', win: 2},
  {id: 1801, a: 'Philip Hamilton', b: 'George I. Eacker', win: 2},
  {id: 1804, a: 'Aaron Burr', b: 'Alexander Hamilton', win: 1},
];

const DUEL_VIEW = () => [
  {id: 1801, winner: 'George I. Eacker'},
  {id: 1804, winner: 'Aaron Burr'},
  {id: 1777, winner: 'Lachlan McIntosh'},
];

const UPDATE_DUEL = function (view, model, index) {
  view.id = model.id;
  view.winner = model.win === 1 ? model.a : model.b;
  return view;
};


test('Group', (t) => {
  var group = duil.Group();
  t.ok(group, 'empty group exists');
  t.same(group.data, []);
  t.same(group.views, []);

  t.end();
});

test('Group.key', (t) => {
  const group = duil.Group({
    data: DUEL_MODEL(),
    views: DUEL_MODEL(),

    // @override
    key: duil.Group.KEY_BY_ID
  });

  t.ok(group.data.length, 'have data');

  const view = group.key(DUEL_MODEL()[1], 1);
  t.same(view, DUEL_MODEL()[1]);
  t.end();
});

test('Group.create', (t) => {
  const group = duil.Group({
    data: DUEL_MODEL(),
    views: DUEL_VIEW(),

    // @override
    key: duil.Group.KEY_BY_ID,

    // @override
    update: UPDATE_DUEL
  });

  group.set({data: group.data.concat([{
    id: 1806, a: 'Andrew Jackson', b: 'Charles Dickinson', win: 1
  }])});

  t.is(group.data.length, DUEL_MODEL().length + 1);
  t.is(group.views.length, DUEL_VIEW().length + 1);

  t.same(group.views[group.views.length - 1], {
    id: 1806, winner: 'Andrew Jackson'
  });

  t.end();
});

test('Group.remove', (t) => {
  const group = duil.Group({
    data: DUEL_MODEL(),
    views: DUEL_VIEW(),

    // @override
    key: duil.Group.KEY_BY_ID,

    // @override
    update: UPDATE_DUEL
  });

  group.set({data: group.data.slice(0, -2)});
  t.is(group.data.length, DUEL_MODEL().length - 2);
  t.is(group.views.length, DUEL_VIEW().length - 2);
  t.end();
});
