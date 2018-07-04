import test from 'tape';
import Widget from '../src/Widget';

test('Widget is not empty', (t) => {
  var widget = new Widget();

  t.ok(widget, 'widget exists');
  t.is(widget.name, undefined, 'unknown property is undefined');

  t.end();
});

test('Widget constructor', (t) => {
  const value = 5;
  var thing = new Widget({
    value: value,
    method: function () { return this.value; }
  });

  t.is(thing.value, value, 'property is added');
  t.is(thing.method(), value, 'functions is bound to the widget');

  thing.set({method: function () { return -this.value; }});
  t.is(thing.method(), -value, 'functions can override properly');

  t.end();
});

test('Widget subclassing', (t) => {
  class NumberWidget extends Widget {
    constructor(props) {
      super(Object.assign({val: 42}, props));
    }
  }

  var MyNumber = new NumberWidget();
  t.is(MyNumber.val, 42);

  var YourNumber = new NumberWidget({val: 24});
  t.is(YourNumber.val, 24);

  t.end();
});

test('Widget superclass', (t) => {
  class WidgetA extends Widget {
    constructor(props) {
      Object.assign(WidgetA.prototype, {name: 'WidgetA'});
      super(props)
    }

    say(punct) { return 'I am ' + this.name + (punct || ''); }
  }

  var a = new WidgetA();
  t.is(a.say(), 'I am WidgetA');

  class WidgetB extends WidgetA {
    constructor(props) {
      Object.assign(WidgetB.prototype, {punct: '!', name: 'WidgetB'});
      super(props);
    }

    say() { return super.say(this.punct); } // @override
  }

  var b = new WidgetB({name: 'Bob'});
  t.is(b.say(), 'I am Bob!');

  class WidgetC extends WidgetB {
    constructor(props) {
      Object.assign(WidgetC.prototype, {name: 'WidgetC'});
      super(props);
    }

    // @override
    say(insult) {
      return this.invoke(WidgetA, 'say', `, ${insult}${super.punct}`);
    }
  }

  var c = new WidgetC({name: 'Sparticus'});
  t.is(c.say('you fool'), 'I am Sparticus, you fool!');

  t.end();
});

test('Widget.init', (t) => {
  var MyWidget = new Widget({
    // @override
    init: function () {
      this.value = 42;
      return this;
    }
  });
  t.is(MyWidget.value, 42);

  t.end();
});

test('Widget.render', (t) => {
  var widget = new Widget({
    model: 0,
    view: 'zero',

    // @override
    render: function () {
      this.view = 0 === this.model ? 'zero' : 'non-zero';
    }
  });

  t.is(widget.model, 0);
  t.is(widget.view, 'zero');

  widget.set({model: 1});
  t.is(widget.model, 1);
  t.is(widget.view, 'non-zero');

  t.end();
});

test('Widget.set', (t) => {
  var MyWidget = new Widget({
    'stats.count': 42
  });
  t.is(MyWidget.stats.count, 42);

  MyWidget.set({'stats.count': MyWidget.stats.count + 1});
  t.is(MyWidget.stats.count, 43);

  t.end();
});


test('Widget.on', (t) => {
  var side = new Widget();
  var src = new Widget({property: {value: 1}});
  var dst = new Widget({
    name: 'dst',
    times: 0,
    property: src.property,

    init: function () {
      src.on('render', this.count);
      return this;
    },

    count: function () {
      this.times += 1;
      return this;
    }
  });

  src.on('*,render', (e) => { t.ok(true, 'multiple handlers called')});

  src.render();
  t.is(dst.times, 0, 'no call on src.render without changes');

  src.render({change: [false, true]});
  t.is(dst.times, 1, 'call on src.render with changes');

  src.trigger('render');
  t.is(dst.times, 2, 'call on src.trigger render');

  src.trigger('*');
  t.is(dst.times, 2, 'call on src.trigger *');

  src.set({'property.value': 2});
  t.is(dst.times, 3, 'call on src.set with new value');

  src.set({'property.value': 2});
  t.is(dst.times, 3, 'no call on src.render with old value');

  side.trigger('render');
  t.is(dst.times, 3, 'no call on side.trigger');

  t.end();
});


test('Widget.off', (t) => {
  let count = 0;
  const widget = new Widget();
  const inc = () => { count += 1 };
  widget.on('*,custom', inc);

  widget.trigger('custom');
  t.is(count, 2, 'expect custom and global handlers');

  widget.off('custom', inc);
  widget.trigger('custom');
  t.is(count, 3, 'expect only global handler');

  widget.off();
  widget.trigger('custom');
  t.is(count, 3, 'expect no handlers');

  t.end();
});


test('Widget.trigger', (t) => {
  const widget = new Widget();
  widget.on('myevent', (e) => {
    t.is(e.type, 'myevent');
    t.is(e.target, widget);
    t.same(e.data, {extra: 'data'});
  });
  widget.trigger('myevent', {extra: 'data'});

  t.ok(widget.trigger('noevent'));

  t.end();
});
