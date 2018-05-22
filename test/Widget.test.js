const test = require('tape');
const duil = require('../dist/duil.min');

test('Widget is not empty', (t) => {
  var widget = new duil.Widget();

  t.ok(widget, 'widget exists');
  t.is(widget.name, undefined, 'unknown property is undefined');

  t.end();
});

test('Widget constructor', (t) => {
  const value = 5;
  var thing = new duil.Widget({
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
  class NumberWidget extends duil.Widget {
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
  class WidgetA extends duil.Widget {
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
  var widget = new duil.Widget({
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
  var MyWidget = new duil.Widget({
    'stats.count': 42
  });
  t.is(MyWidget.stats.count, 42);

  MyWidget.set({'stats.count': MyWidget.stats.count + 1});
  t.is(MyWidget.stats.count, 43);

  t.end();
});


test('Widget.on', (t) => {
  var count = 0;
  var widget1 = new duil.Widget({property: {value: 1}});
  var widget2 = new duil.Widget({
    property: widget1.property,

    init: function () {
      widget1.on('render', this.render);
      return this;
    },

    render: function () {
      count += 1;
      return this;
    }
  });
  t.is(count, 1, 'render called on creation');


  widget2.render();
  t.is(count, 2, 'render called directly');

  widget1.set('property.value', 2);
  t.is(count, 3, 'render called when widget is updated');

  widget1.set('property.value', 2);
  t.is(count, 3, 'render NOT called when no updates');

  widget1.trigger('render');
  t.is(count, 4, 'render called when widget is triggered');

  t.end();
});


test('Widget.trigger', (t) => {
  const widget = new duil.Widget();
  widget.on('myevent', (e) => {
    t.is(e.type, 'myevent');
    t.is(e.target, widget);
    t.same(e.data, {extra: 'data'});
  });
  widget.trigger('myevent', {extra: 'data'});

  t.ok(widget.trigger('noevent'));

  t.end();
});
