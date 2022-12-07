import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementStyle } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

test('footer styles', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        themeData: {
            style: {
                footer: {
                    padding: '10px',
                    margin: '5px 0 10px',
                    background: '#dddddd',
                    border: {
                        top: '1px solid #ff0000',
                        right: '1px solid #ff0000',
                        bottom: '1px solid #ff0000',
                        left: '1px solid #ff0000'
                    }
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.dw-chart-footer', 'padding'), '10px');
    t.is(await getElementStyle(page, '.dw-chart-footer', 'margin'), '5px 0px 10px');
    t.is(await getElementStyle(page, '.dw-chart-footer', 'background-color'), 'rgb(221, 221, 221)');
    t.is(await getElementStyle(page, '.dw-chart-footer', 'border-top'), '1px solid rgb(255, 0, 0)');
    t.is(
        await getElementStyle(page, '.dw-chart-footer', 'border-right'),
        '1px solid rgb(255, 0, 0)'
    );
    t.is(
        await getElementStyle(page, '.dw-chart-footer', 'border-bottom'),
        '1px solid rgb(255, 0, 0)'
    );
    t.is(
        await getElementStyle(page, '.dw-chart-footer', 'border-left'),
        '1px solid rgb(255, 0, 0)'
    );
});

test('footer typography', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        themeData: {
            typography: {
                footer: {
                    typeface: 'Arial',
                    fontSize: 13,
                    cursive: 1,
                    lineHeight: 20,
                    fontWeight: 300,
                    fontStretch: 'condensed',
                    letterSpacing: 1,
                    underlined: true,
                    textTransform: 'uppercase',
                    color: '#999999'
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.dw-chart-footer', 'font-family'), 'Arial');
    t.is(await getElementStyle(page, '.dw-chart-footer', 'font-size'), '13px');
    t.is(await getElementStyle(page, '.dw-chart-footer', 'font-style'), 'italic');
    t.is(await getElementStyle(page, '.dw-chart-footer', 'line-height'), '20px');
    t.is(await getElementStyle(page, '.dw-chart-footer', 'font-weight'), '300');
    t.is(await getElementStyle(page, '.dw-chart-footer', 'font-stretch'), '75%');
    t.is(await getElementStyle(page, '.dw-chart-footer', 'letter-spacing'), '1px');
    t.is(await getElementStyle(page, '.dw-chart-footer', 'text-decoration-line'), 'underline');
    t.is(await getElementStyle(page, '.dw-chart-footer', 'text-transform'), 'uppercase');
    t.is(await getElementStyle(page, '.dw-chart-footer', 'color'), 'rgb(153, 153, 153)');
});

test('above footer styles', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        chart: {
            metadata: {
                annotate: {
                    notes: 'Here is some notes text so that above footer element renders'
                }
            }
        },
        themeData: {
            style: {
                aboveFooter: {
                    padding: '10px',
                    margin: '5px 0 10px',
                    background: '#dddddd',
                    textAlign: 'center',
                    border: {
                        top: '1px solid #ff0000',
                        right: '1px solid #ff0000',
                        bottom: '1px solid #ff0000',
                        left: '1px solid #ff0000'
                    }
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.dw-above-footer', 'padding'), '10px');
    t.is(await getElementStyle(page, '.dw-above-footer', 'margin'), '5px 0px 10px');
    t.is(await getElementStyle(page, '.dw-above-footer', 'background-color'), 'rgb(221, 221, 221)');
    t.is(await getElementStyle(page, '.dw-above-footer', 'text-align'), 'center');
    t.is(await getElementStyle(page, '.dw-above-footer', 'border-top'), '1px solid rgb(255, 0, 0)');
    t.is(
        await getElementStyle(page, '.dw-above-footer', 'border-right'),
        '1px solid rgb(255, 0, 0)'
    );
    t.is(
        await getElementStyle(page, '.dw-above-footer', 'border-bottom'),
        '1px solid rgb(255, 0, 0)'
    );
    t.is(
        await getElementStyle(page, '.dw-above-footer', 'border-left'),
        '1px solid rgb(255, 0, 0)'
    );
});

test('above footer typography', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        chart: {
            metadata: {
                annotate: {
                    notes: 'Here is some notes text so that above footer element renders'
                }
            }
        },
        themeData: {
            typography: {
                aboveFooter: {
                    typeface: 'Arial',
                    fontSize: 13,
                    cursive: 1,
                    lineHeight: 20,
                    fontWeight: 300,
                    fontStretch: 'condensed',
                    letterSpacing: 1,
                    underlined: true,
                    textTransform: 'uppercase',
                    color: '#999999'
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.dw-above-footer', 'font-family'), 'Arial');
    t.is(await getElementStyle(page, '.dw-above-footer', 'font-size'), '13px');
    t.is(await getElementStyle(page, '.dw-above-footer', 'font-style'), 'italic');
    t.is(await getElementStyle(page, '.dw-above-footer', 'line-height'), '20px');
    t.is(await getElementStyle(page, '.dw-above-footer', 'font-weight'), '300');
    t.is(await getElementStyle(page, '.dw-above-footer', 'font-stretch'), '75%');
    t.is(await getElementStyle(page, '.dw-above-footer', 'letter-spacing'), '1px');
    t.is(await getElementStyle(page, '.dw-above-footer', 'text-decoration-line'), 'underline');
    t.is(await getElementStyle(page, '.dw-above-footer', 'text-transform'), 'uppercase');
    t.is(await getElementStyle(page, '.dw-above-footer', 'color'), 'rgb(153, 153, 153)');
});

test('below footer styles', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        chart: {
            metadata: {
                annotate: {
                    notes: 'Here is some notes text so that below footer element renders (we move notes to below footer by using a theme option)'
                }
            }
        },
        themeData: {
            options: {
                blocks: { notes: { region: 'belowFooter' } }
            },
            style: {
                belowFooter: {
                    padding: '10px',
                    margin: '5px 0 10px',
                    background: '#dddddd',
                    textAlign: 'center',
                    border: {
                        top: '1px solid #ff0000',
                        right: '1px solid #ff0000',
                        bottom: '1px solid #ff0000',
                        left: '1px solid #ff0000'
                    }
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.dw-below-footer', 'padding'), '10px');
    t.is(await getElementStyle(page, '.dw-below-footer', 'margin'), '5px 0px 10px');
    t.is(await getElementStyle(page, '.dw-below-footer', 'background-color'), 'rgb(221, 221, 221)');
    t.is(await getElementStyle(page, '.dw-below-footer', 'text-align'), 'center');
    t.is(await getElementStyle(page, '.dw-below-footer', 'border-top'), '1px solid rgb(255, 0, 0)');
    t.is(
        await getElementStyle(page, '.dw-below-footer', 'border-right'),
        '1px solid rgb(255, 0, 0)'
    );
    t.is(
        await getElementStyle(page, '.dw-below-footer', 'border-bottom'),
        '1px solid rgb(255, 0, 0)'
    );
    t.is(
        await getElementStyle(page, '.dw-below-footer', 'border-left'),
        '1px solid rgb(255, 0, 0)'
    );
});

test('below footer typography', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        chart: {
            metadata: {
                annotate: {
                    notes: 'Here is some notes text so that below footer element renders (we move notes to below footer by using a theme option)'
                }
            }
        },
        themeData: {
            options: {
                blocks: { notes: { region: 'belowFooter' } }
            },
            typography: {
                belowFooter: {
                    typeface: 'Arial',
                    fontSize: 13,
                    cursive: 1,
                    lineHeight: 20,
                    fontWeight: 300,
                    fontStretch: 'condensed',
                    letterSpacing: 1,
                    underlined: true,
                    textTransform: 'uppercase',
                    color: '#999999'
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.dw-below-footer', 'font-family'), 'Arial');
    t.is(await getElementStyle(page, '.dw-below-footer', 'font-size'), '13px');
    t.is(await getElementStyle(page, '.dw-below-footer', 'font-style'), 'italic');
    t.is(await getElementStyle(page, '.dw-below-footer', 'line-height'), '20px');
    t.is(await getElementStyle(page, '.dw-below-footer', 'font-weight'), '300');
    t.is(await getElementStyle(page, '.dw-below-footer', 'font-stretch'), '75%');
    t.is(await getElementStyle(page, '.dw-below-footer', 'letter-spacing'), '1px');
    t.is(await getElementStyle(page, '.dw-below-footer', 'text-decoration-line'), 'underline');
    t.is(await getElementStyle(page, '.dw-below-footer', 'text-transform'), 'uppercase');
    t.is(await getElementStyle(page, '.dw-below-footer', 'color'), 'rgb(153, 153, 153)');
});
