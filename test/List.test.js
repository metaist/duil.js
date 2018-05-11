const end_jsdom = require('jsdom-global')();
const $ = require('jquery');
const test = require('tape');
const duil = require('../dist/duil');

test('List', (t) => {
  var list = new duil.List();

  t.ok(list, 'empty list exists');
  t.same(list.data, []);
  t.same(list.views, []);

  t.end();
});


test('basic ul', (t) => {
  var $dom = $('<ul id="my-list"><li></li></ul>');
  var list = new duil.List({
    $dom: $dom[0],
    selector: 'li'
  });

  t.ok(list, 'list exists');
  t.is($dom.text(), '', 'list has no content');
  t.same($dom.children().get(), [], 'template is removed');

  var data = [
    'Do you bite your thumb at us, sir?',
    'I do bite my thumb, sir.',
    'Do you quarrel, sir?',
    'Quarrel, sir? No, sir.'
  ];
  list.set({data: data});

  t.is($dom.children().length, 4, 'children are added');
  t.is($dom.find('li').eq(0).text(), data[0], 'template is rendered');

  data = data.slice(1, -1);
  list.set({data: data});
  t.is($dom.children().length, 2, 'children are added');
  t.is($dom.find('li').eq(0).text(), data[0], 'template is rendered');

  t.end();
});


test('more complex list', (t) => {
  var $dom = $(`<div id="duelists">
  <div class="duelist">
    <span class="year"></span>
    <a href=""></a>
  </div>
</div>`);

  var list = new duil.List({
    $dom: $dom,
    selector: '.duelist',

    // @override
    update: function (view, model, index) {
      $(view)
        .find('.year').text(model.year).end()
        .find('a')
          .text(model.name)
          .attr('href', `mailto:${model.email}`)
        .end();
      return view;
    }
  });

  var data = [
    {year: 1777, name: 'Lachlan McIntosh', email: 'lachlanmc@example.com'},
    {year: 1801, name: 'George I. Eacker', email: 'george.eacker@example.com'},
    {year: 1804, name: 'Aaron Burr', email: 'aaron.burr@example.com'},
  ];

  list.set({data: data});

  t.is($dom.find('.duelist').length, data.length, 'same number of divs');
  t.is($dom.find('.year').length, data.length, 'same number of years');
  t.is($dom.find('a').length, data.length, 'same number of links');

  data.forEach((item, index) => {
    t.is($dom.find('.year').eq(index).text(), `${item.year}`);
    t.is($dom.find('a').eq(index).attr('href'), `mailto:${item.email}`);
    t.is($dom.find('a').eq(index).text(), `${item.name}`);
  });

  t.end();
});


end_jsdom();
