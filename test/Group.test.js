import test from 'tape';
import Group from '../src/Group';

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
  view.winner = 1 === model.win ? model.a : model.b;
  return view;
};

test('Group', (t) => {
  var group = new Group();
  t.ok(group, 'empty group exists');
  t.same(group.data, []);
  t.same(group.views, []);

  t.end();
});

test('Group.key [by index]', (t) => {
  const group = new Group({
    data: [1, 2, 3],
    views: ['this-1', 'this-2', 'this-3'],
  });

  t.ok(group.data.length, 'have data');

  const view = group.key(group.data[1], 1);
  t.same(view, group.views[1]);

  t.same(null, group.key({}, 100));
  t.end();
});


test('Group.key [by id]', (t) => {
  let group, view;

  group = new Group({
    data: DUEL_MODEL(),
    views: DUEL_MODEL(),

    // @override
    key: Group.KEY_BY_ID
  });

  t.ok(group.data.length, 'have data');

  view = group.key(DUEL_MODEL()[1], 1);
  t.same(view, DUEL_MODEL()[1]);


  view = group.key(null, -1);
  t.same(view, null, 'expect no view for null model');

  view = group.key({}, -1);
  t.same(view, null, 'expect no view empty model');

  view = group.key({id: -1}, -1);
  t.same(view, null, 'expect no view invalid id');

  t.end();
});

test('Group.create', (t) => {
  const group = new Group({
    data: DUEL_MODEL(),
    views: DUEL_VIEW(),

    // @override
    key: Group.KEY_BY_ID,

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
  const group = new Group({
    data: DUEL_MODEL(),
    views: DUEL_VIEW(),

    // @override
    key: Group.KEY_BY_ID,

    // @override
    update: UPDATE_DUEL
  });

  group.set({data: group.data.slice(0, -2)});
  t.is(group.data.length, DUEL_MODEL().length - 2);
  t.is(group.views.length, DUEL_VIEW().length - 2);

  t.end();
});

test('Group.render', (t) => {
  let group, count = 0;

  group = new Group({config: {
    showWarning: true, // coverage: show a console warning
    largeChange: 0, // force async render for everything
    drainGrowth: 0 // force manual advancing of drain calls
  }});
  group.on('render', () => {
    count += 1;
  });

  group.render({});
  t.is(count, 1);

  group.set({otherVar: false});
  t.is(count, 2, 'changing a non-data field causes full render');

  group.set({data: [{x: 1}, {x: 2}, {x: 3}]});
  group.config.showWarning = false; // don't show more warnings
  t.is(count, 2, 'not done rendering');
  t.same(group.views[0], {x: 1}, 'first item processed');
  t.same(group.views[1], undefined, 'second item still unprocessed');
  group.drain();
  t.same(group.views[1], {x: 2}, 'second item processed');
  t.same(group.views[2], undefined, 'third item still unprocessed');

  group.render(); // coverage: render a step without a key (do nothing)
  group.render(0); // coverage: force render of previous step
  group.render(2); // coverage: render next step
  group.render(1000); // coverage: render a step with illegal key
  group.drain();
  t.is(count, 3, 'done rendering');

  group.config.drainGrowth = 2;
  group.set({data: [{a: 1}, {a: 2}]}); // coverage: schedule future drain

  group.render({'data.1000.x': 10}); // coverage: illegal index doesn't break

  const ns = group[Object.getOwnPropertySymbols(group)[0]];
  ns.diff[-10] = -1;
  t.throws(() => group.render(-10), /^Error: unknown diff type(.*)/,
    'illegal diff throws error');

  t.end();
});
