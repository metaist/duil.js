const test = require('tape');
const duil = require('../dist/duil');

test('Widget is not empty', (t) => {
  var widget = duil.Widget();

  t.ok(widget, 'widget exists');
  t.is(widget.name, undefined, 'unknown property is undefined');

  t.end();
});

test('Widget constructor', (t) => {
  var thing = new duil.Widget({
    value: 5,
    method: function () { return this.value; }
  });

  t.is(thing.value, 5, 'property is added');
  t.is(thing.method(), 5, 'functions is bound to the widget');

  t.end();
});

test('Widget.subclass', (t) => {
  var NumberWidget = duil.Widget.subclass({val: 42});
  var MyNumber = new NumberWidget();
  t.is(MyNumber.val, 42);

  var YourNumber = new NumberWidget({val: 24});
  t.is(YourNumber.val, 24);

  t.end();
});

test('Widget.superclass', (t) => {
  var WidgetA = duil.Widget.subclass({
    name: 'WidgetA',
    say: function (punct) {
      return 'I am ' + this.name + (punct || '');
    }
  });

  var a = new WidgetA();
  t.is(a.say(), 'I am WidgetA');

  var WidgetB = WidgetA.subclass({
    punct: '!',

    // @override
    name: 'WidgetB',

    // @override
    say: function () {
      return this.superclass('say', this.punct);
    }
  });

  var b = new WidgetB({name: 'Bob'});
  t.is(b.say(), 'I am Bob!');

  var WidgetC = WidgetB.subclass({
    // @override
    name: 'WidgetC',

   // @override
   say: function (insult) {
     return this.superclass(WidgetA, 'say', ', ' + insult) +
            this.superclass('punct');
    }
  });

  var c = new WidgetC({name: 'Sparticus'});
  t.is(c.say('you fool'), 'I am Sparticus, you fool!');

  t.end();
});

test('Widget.init', (t) => {
  var MyWidget = new duil.Widget({
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
  var widget = duil.Widget({
    model: 0,
    view: 'zero',

    // @override
    render: function () {
      this.view = this.model === 0 ? 'zero' : 'non-zero';
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
  var MyWidget = new duil.Widget({
    'stats.count': 42
  });
  t.is(MyWidget.stats.count, 42);

  MyWidget.set({'stats.count': MyWidget.stats.count + 1});
  t.is(MyWidget.stats.count, 43);

  t.end();
});
