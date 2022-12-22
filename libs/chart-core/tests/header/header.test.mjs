import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementStyle, getElementInnerText, getElementBoundingBox } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

test('basic chart header', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            title: 'Headline',
            metadata: {
                describe: {
                    intro: 'Intro'
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.dw-chart-header', 'margin'), '0px');
});

test('custom header styles', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            title: 'Headline',
            metadata: {
                describe: {
                    intro: 'Intro'
                }
            }
        },
        themeData: {
            style: {
                header: {
                    padding: '12px',
                    margin: '5px 0 10px',
                    background: '#ffffff',
                    textAlign: 'center',
                    border: {
                        top: '5px solid #ff0000',
                        right: '5px solid #ff0000',
                        bottom: '5px solid #ff0000',
                        left: '5px solid #ff0000'
                    }
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.dw-chart-header', 'padding'), '12px');
    t.is(await getElementStyle(page, '.dw-chart-header', 'margin'), '5px 0px 10px');
    t.is(await getElementStyle(page, '.dw-chart-header', 'background-color'), 'rgb(255, 255, 255)');
    t.is(await getElementStyle(page, '.dw-chart-header', 'text-align'), 'center');
    t.is(await getElementStyle(page, '.dw-chart-header', 'border-top'), '5px solid rgb(255, 0, 0)');
    t.is(
        await getElementStyle(page, '.dw-chart-header', 'border-right'),
        '5px solid rgb(255, 0, 0)'
    );
    t.is(
        await getElementStyle(page, '.dw-chart-header', 'border-bottom'),
        '5px solid rgb(255, 0, 0)'
    );
    t.is(
        await getElementStyle(page, '.dw-chart-header', 'border-left'),
        '5px solid rgb(255, 0, 0)'
    );
    t.is(await getElementStyle(page, '.dw-chart-header', 'border-left-color'), 'rgb(255, 0, 0)');
});

test('header right', async t => {
    const { page } = t.context;

    const title = 'This is a very long headline';
    await renderDummy(t, {
        chart: {
            title,
            metadata: {
                publish: { blocks: { logo: { enabled: true } } },
                describe: {
                    intro: 'Intro'
                }
            }
        },
        themeData: {
            typography: { headline: { fontSize: 30 } },
            style: { header: { background: '#eedddd', padding: '10px' } },
            options: {
                blocks: {
                    description: { region: 'belowHeader' },
                    logo: {
                        region: 'headerRight',
                        data: { options: [{ id: 't', text: 'LOGO', title: 't' }] }
                    }
                },
                header: {
                    gap: 50
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.dw-chart-header', 'padding'), '10px');
    t.is(await getElementStyle(page, '.dw-chart-header', 'background-color'), 'rgb(238, 221, 221)');
    t.is(await getElementStyle(page, '.dw-chart-header.has-header-right', 'gap'), '50px');
    t.is(await getElementInnerText(page, '.dw-chart-header .dw-chart-header-left'), title);
    t.is(await getElementInnerText(page, '.dw-chart-header .dw-chart-header-right'), 'LOGO');
    t.is(await getElementInnerText(page, '.dw-below-header'), 'Intro');

    const WIDTH = 600;

    const bboxHeadline = await getElementBoundingBox(page, '.headline-block');
    const bboxLogo = await getElementBoundingBox(page, '.logo-block');
    const bboxIntro = await getElementBoundingBox(page, '.description-block');

    t.is(bboxHeadline.left, 10); // 10px padding
    t.is(bboxHeadline.top, 10); // 10px padding
    t.is(bboxLogo.top, 10); // -10px padding
    t.is(bboxLogo.right, WIDTH - 10); // -10px padding
    t.true(bboxHeadline.right < bboxLogo.left);
    t.true(bboxIntro.top > bboxHeadline.bottom);
});
