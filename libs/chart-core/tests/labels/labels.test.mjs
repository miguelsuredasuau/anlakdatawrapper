import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementStyle } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

test('core label styles', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        themeData: {
            typography: {
                chart: {
                    fontSize: 13
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.label', 'font-size'), '13px');
});

test('label legend styles', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        themeData: {
            style: {
                chart: {
                    labels: {
                        legend: {
                            color: '#ff0000',
                            fontSize: 13,
                            fontWeight: 300,
                            letterSpacing: 1.5,
                            lineHeight: 20,
                            // @todo: why is `tabularNums` not in the theme schema? It is a prop that is referenced in `themeStyles.js`
                            // tabularNums: true,
                            textTransform: 'uppercase',
                            typeface: 'Arial'
                        }
                    }
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.label.legend-text', 'color'), 'rgb(255, 0, 0)');
    t.is(await getElementStyle(page, '.label.legend-text', 'font-size'), '13px');
    t.is(await getElementStyle(page, '.label.legend-text', 'font-weight'), '300');
    t.is(await getElementStyle(page, '.label.legend-text', 'letter-spacing'), '1.5px');
    t.is(await getElementStyle(page, '.label.legend-text', 'line-height'), '20px');
    // t.is(await getElementStyle(page, '.label.legend-text', 'font-feature-settings'), 'tnum');
    t.is(await getElementStyle(page, '.label.legend-text', 'text-transform'), 'uppercase');
    t.is(await getElementStyle(page, '.label.legend-text', 'font-family'), 'Arial');
});

test('value label styles', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        themeData: {
            style: {
                chart: {
                    labels: {
                        values: {
                            color: '#ff0000',
                            fontSize: 13,
                            letterSpacing: 1.5,
                            // @todo: why is `tabularNums` not in the theme schema? It is a prop that is referenced in `themeStyles.js`
                            // tabularNums: true,
                            typeface: 'Arial'
                        }
                    }
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.label.value', 'color'), 'rgb(255, 0, 0)');
    t.is(await getElementStyle(page, '.label.value', 'font-size'), '13px');
    t.is(await getElementStyle(page, '.label.value', 'letter-spacing'), '1.5px');
    // t.is(await getElementStyle(page, '.label.value', 'font-feature-settings'), 'tnum');
    t.is(await getElementStyle(page, '.label.value', 'font-family'), 'Arial');
});

test('inside label styles', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        themeData: {
            style: {
                chart: {
                    labels: {
                        inside: {
                            inverted: '#dddddd',
                            normal: '#444444'
                        }
                    }
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.label.inverted span', 'color'), 'rgb(221, 221, 221)');
    t.is(await getElementStyle(page, '.label.inside span', 'color'), 'rgb(68, 68, 68)');
});
