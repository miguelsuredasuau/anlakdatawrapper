import {
    parseFlagsFromURL,
    resolveCondition,
    computeThemeData,
    toPixel,
    lineHeight
} from './shared.mjs';
import test from 'ava';

const searchString =
    'a=text&' +
    'b=text%20with%20spaces&' +
    'c={"obj":"obj"}&' +
    'd=0&' +
    'e=0.0&' +
    'f=1&' +
    'g=1.2&' +
    'h=true&' +
    'i=false&' +
    'j=null&' +
    'k=NaN&' +
    'l=';

test('parseFlagsFromURL parses flags as string', t => {
    t.deepEqual(
        parseFlagsFromURL(searchString, {
            a: String,
            b: String,
            c: String,
            d: String,
            e: String,
            f: String,
            g: String,
            h: String,
            i: String,
            j: String,
            k: String,
            l: String,
            missing: String
        }),
        {
            a: 'text',
            b: 'text with spaces',
            c: '{"obj":"obj"}',
            d: '0',
            e: '0.0',
            f: '1',
            g: '1.2',
            h: 'true',
            i: 'false',
            j: 'null',
            k: 'NaN',
            l: '',
            missing: null
        }
    );
});

test('parseFlagsFromURL parses flags as boolean', t => {
    t.deepEqual(
        parseFlagsFromURL(searchString, {
            a: Boolean,
            b: Boolean,
            c: Boolean,
            d: Boolean,
            e: Boolean,
            f: Boolean,
            g: Boolean,
            h: Boolean,
            i: Boolean,
            j: Boolean,
            k: Boolean,
            l: Boolean,
            missing: Boolean
        }),
        {
            a: true,
            b: true,
            c: true,
            d: false, // 0
            e: true,
            f: true,
            g: true,
            h: true,
            i: false, // false
            j: false, // null
            k: true,
            l: false, // empty string
            missing: false
        }
    );
});

test('parseFlagsFromURL ignores flags that do not appear in the types object', t => {
    t.deepEqual(
        parseFlagsFromURL('a=a&b=b&c=c', {
            b: String
        }),
        {
            b: 'b'
        }
    );
});

test('parseFlagsFromURL uses the first value in case of duplicate parameters', t => {
    t.deepEqual(
        parseFlagsFromURL('a=1&a=2', {
            a: String
        }),
        {
            a: '1'
        }
    );
});

test('resolveCondition - all', t => {
    t.is(resolveCondition(['all', true, true, false]), false);
    t.is(resolveCondition(['all', true, true, true]), true);
    t.is(resolveCondition(['all', true, true]), true);
});

test('resolveCondition - any', t => {
    t.is(resolveCondition(['any', true, true, false]), true);
    t.is(resolveCondition(['any', true, true, true]), true);
    t.is(resolveCondition(['any', false, false]), false);
});

test('resolveCondition - not', t => {
    t.is(resolveCondition(['!', true]), false);
    t.is(resolveCondition(['!', false]), true);
});

test('resolveCondition - in', t => {
    t.is(resolveCondition(['in', 'x', ['x', 'y', 'z']]), true);
    t.is(resolveCondition(['in', 'a', ['x', 'y', 'z']]), false);
});

test('resolveCondition - less, equal, more', t => {
    t.is(resolveCondition(['==', 42, 42]), true);
    t.is(resolveCondition(['==', 42, 41]), false);
    t.is(resolveCondition(['!=', 42, 42]), false);
    t.is(resolveCondition(['!=', 42, 41]), true);
    t.is(resolveCondition(['>', 1, 2]), false);
    t.is(resolveCondition(['>', 2, 2]), false);
    t.is(resolveCondition(['>', 3, 2]), true);
    t.is(resolveCondition(['>=', 1, 2]), false);
    t.is(resolveCondition(['>=', 2, 2]), true);
    t.is(resolveCondition(['>=', 3, 2]), true);
    t.is(resolveCondition(['<', 1, 2]), true);
    t.is(resolveCondition(['<', 2, 2]), false);
    t.is(resolveCondition(['<', 3, 2]), false);
    t.is(resolveCondition(['<=', 1, 2]), true);
    t.is(resolveCondition(['<=', 2, 2]), true);
    t.is(resolveCondition(['<=', 3, 2]), false);
});

test('resolveCondition - get', t => {
    t.is(resolveCondition(['get', 'width'], { width: 420 }), 420);
    t.is(resolveCondition(['get', 'type'], { type: 'd3-lines' }), 'd3-lines');
    t.is(resolveCondition(['get', 'custom.foo'], { custom: { foo: 42 } }), 42);
});

test('resolveCondition - has', t => {
    t.is(resolveCondition(['has', 'width'], { width: 420 }), true);
    t.is(resolveCondition(['has', 'type'], { type: 'd3-lines' }), true);
    t.is(resolveCondition(['has', 'headline'], { headline: 'Foo' }), true);
    t.is(resolveCondition(['has', 'headline'], { headline: '' }), false);
    t.is(resolveCondition(['has', 'title'], { headline: '' }), false);
});

test('resolveCondition - length', t => {
    t.is(resolveCondition(['length', 'title'], { title: 'This is the title' }), 5);
    t.is(resolveCondition(['length', ['get', 'title']], { title: 'This is the title' }), 17);
});

test('resolveCondition - stripHtml', t => {
    t.is(resolveCondition(['stripHtml', '<b>foo</b> &gt; bar']), 'foo &gt; bar');
    t.is(
        resolveCondition(['stripHtml', ['get', 'title']], { title: '<b>foo</b> &gt; bar' }),
        'foo &gt; bar'
    );
});

test('resolveCondition - combined', t => {
    t.is(resolveCondition(['>', ['get', 'width'], 400], { width: 420 }), true);
    t.is(resolveCondition(['>', ['get', 'width'], ['get', 'foo']], { width: 420, foo: 400 }), true);
    t.is(resolveCondition(['all', ['get', 'custom.bool'], true], { custom: { bool: true } }), true);
    t.is(
        resolveCondition(
            ['all', ['>', ['get', 'width'], 400], ['==', ['get', 'type'], 'd3-lines']],
            {
                width: 450,
                type: 'd3-lines'
            }
        ),
        true
    );
    t.is(
        resolveCondition(
            [
                'any',
                ['<=', ['get', 'width'], 400],
                ['in', ['get', 'type'], ['d3-lines', 'd3-area']]
            ],
            {
                width: 450,
                type: 'd3-lines'
            }
        ),
        true
    );
});

test('computeThemeData - does not change source theme data', t => {
    const inputTheme = {
        colors: { background: 'white' },
        overrides: [
            {
                condition: true,
                settings: {
                    'colors.background': '#eeeeee'
                }
            }
        ]
    };
    const outputTheme = computeThemeData(inputTheme, {});
    t.is(outputTheme.colors.background, '#eeeeee');
    t.is(inputTheme.colors.background, 'white');
});

test('computeThemeData - multiple overrides are executed in order', t => {
    const inputTheme = {
        colors: { background: 'white' },
        overrides: [
            {
                condition: true,
                settings: {
                    'colors.background': '#eeeeee'
                }
            },
            {
                condition: true,
                settings: {
                    'colors.background': '#dddddd'
                }
            }
        ]
    };
    const outputTheme = computeThemeData(inputTheme, {});
    t.is(outputTheme.colors.background, '#dddddd');
});

test('computeThemeData - conditions are evaluated', t => {
    const inputTheme = {
        colors: { background: 'white' },
        overrides: [
            {
                condition: ['>', ['get', 'foo'], 42],
                settings: {
                    'colors.background': 'red'
                }
            }
        ]
    };
    const res1 = computeThemeData(inputTheme, { foo: 41 });
    const res2 = computeThemeData(inputTheme, { foo: 42 });
    const res3 = computeThemeData(inputTheme, { foo: 43 });
    t.is(res1.colors.background, 'white');
    t.is(res2.colors.background, 'white');
    t.is(res3.colors.background, 'red');
});

test('computeThemeData - override array ite,s', t => {
    const inputTheme = {
        colors: { palette: ['red', 'green', 'blue'] },
        overrides: [
            {
                condition: true,
                settings: {
                    'colors.palette.1': 'yellow'
                }
            }
        ]
    };
    const res = computeThemeData(inputTheme);
    t.is(res.colors.palette[0], 'red');
    t.is(res.colors.palette[1], 'yellow');
    t.is(res.colors.palette[2], 'blue');
});

test('computeThemeData - overrides may not change overrides', t => {
    const inputTheme = {
        colors: { background: 'white' },
        overrides: [
            {
                condition: true,
                settings: {
                    'overrides.0.condition': false
                }
            }
        ]
    };
    t.throws(() => computeThemeData(inputTheme));
});

test('toPixel - append px only if input is number', t => {
    t.is(toPixel(12), '12px');
    t.is(toPixel('12'), '12');
    t.is(toPixel('12px'), '12px');
    t.is(toPixel('12cm'), '12cm');
});

test('lineHeight - only append px for line heights > 3', t => {
    t.is(lineHeight(1.5), '1.5');
    t.is(lineHeight(2), '2');
    t.is(lineHeight(3), '3');
    t.is(lineHeight(4), '4px');
    t.is(lineHeight(14), '14px');
});
