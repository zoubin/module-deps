var parser = require('../');
var test = require('tape');
var fs = require('fs');
var path = require('path');

var files = {
    foo: path.join(__dirname, '/files/foo.js'),
    bar: path.join(__dirname, '/files/bar.js')
};

var sources = {
    foo: 'notreal foo',
    bar: fs.readFileSync(files.bar, 'utf8')
};

var cache = {};
cache[files.foo] = {
    source: sources.foo,
    deps: { './bar': files.bar }
};

test('uses cache and reads from disk', function (t) {
    t.plan(1);
    var p = parser({ cache: cache });
    p.end({ id: 'foo', file: files.foo, entry: false });
    
    var rows = [];
    p.on('data', function (row) { rows.push(row) });
    p.on('end', function () {
        t.same(rows.sort(cmp), [
            {
                id: 'foo',
                file: files.foo,
                source: sources.foo,
                deps: { './bar': files.bar }
            },
            {
                id: files.bar,
                file: files.bar,
                source: sources.bar,
                deps: {}
            }
        ].sort(cmp));
    });
});

function cmp (a, b) { return a.id < b.id ? -1 : 1 }
