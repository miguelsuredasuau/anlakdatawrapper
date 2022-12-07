import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementStyle, getElementClasses, getElementBoundingBox } from '../helpers/setup.mjs';
import { setTimeout } from 'timers/promises';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

const BLOCKS = {
    logo: {
        data: {
            options: [
                {
                    id: 't',
                    title: 't',
                    height: 30,
                    imgSrc: 'https://dummyimage.com/60x30/e6335f/ffffff.png&text=logo'
                }
            ]
        }
    }
};

test('default layout is inline and vertically centered', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                publish: { blocks: { logo: { enabled: true } } },
                describe: { 'source-name': 'Source Name', byline: 'Foo' }
            }
        },
        themeData: { options: { blocks: BLOCKS } }
    });
    const classNames = await getElementClasses(page, '.footer-left');
    t.true(
        classNames.includes('layout-inline'),
        `[${classNames.join(',')}] does not include .layout-inline`
    );
    t.is(await getElementStyle(page, '.footer-left', 'display'), 'block');
    await setTimeout(1000); // wait for image to be loaded
    t.is(await getElementStyle(page, '.footer-left .source-block', 'display'), 'inline');
    const bboxSource = await getElementBoundingBox(page, '.source-block');
    const bboxLogo = await getElementBoundingBox(page, '.logo-block img');
    // check that logo is vertically centered
    t.is(bboxLogo.top - bboxSource.top, bboxSource.bottom - bboxLogo.bottom);
});

test('footer vertical align items', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                publish: { blocks: { logo: { enabled: true } } },
                describe: { 'source-name': 'Source Name', byline: 'Foo' }
            }
        },
        themeData: { options: { blocks: BLOCKS, footer: { alignItems: 'flex-start' } } }
    });
    await setTimeout(1000); // wait for image to be loaded
    const bboxSource = await getElementBoundingBox(page, '.source-block');
    const bboxLogo = await getElementBoundingBox(page, '.logo-block img');
    // check that logo is top-aligned
    t.is(bboxLogo.top, bboxSource.top);
});

test('flex-row footer region default alignment', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                publish: { blocks: { logo: { enabled: true } } },
                describe: { 'source-name': 'Source Name', byline: 'Foo' }
            }
        },
        themeData: {
            options: {
                blocks: { ...BLOCKS, byline: { region: 'footerRight' } },
                footer: { right: { layout: 'flex-row', gap: 15 } }
            }
        }
    });
    await setTimeout(1000); // wait for image to be loaded
    const bboxByline = await getElementBoundingBox(page, '.footer-right .byline-block');
    const bboxLogo = await getElementBoundingBox(page, '.footer-right .logo-block img');

    // by default, the items within a flex-row region are top-aligned
    t.is(bboxLogo.top, bboxByline.top);
    // check that the gap is correct
    t.is(bboxLogo.left - bboxByline.right, 15);
});

test('flex-row footer region center alignment', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                publish: { blocks: { logo: { enabled: true } } },
                describe: { 'source-name': 'Source Name', byline: 'Foo' }
            }
        },
        themeData: {
            options: {
                blocks: { ...BLOCKS, byline: { region: 'footerRight' } },
                footer: { right: { layout: 'flex-row', alignItems: 'center' } }
            }
        }
    });
    await setTimeout(1000); // wait for image to be loaded
    const bboxByline = await getElementBoundingBox(page, '.footer-right .byline-block');
    const bboxLogo = await getElementBoundingBox(page, '.footer-right .logo-block img');

    // check that logo and byline are vertically centered
    t.is(bboxLogo.top - bboxByline.top, bboxByline.bottom - bboxLogo.bottom);
});

test('footer-left: flex-column is left aligned', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                describe: { 'source-name': 'Source Name', byline: 'Foo' }
            }
        },
        themeData: {
            options: {
                footer: { left: { layout: 'flex-column', gap: 5 } }
            }
        }
    });
    const bboxByline = await getElementBoundingBox(page, '.footer-left .byline-block');
    const bboxSource = await getElementBoundingBox(page, '.footer-left .source-block');

    // check that logo and byline are vertically centered
    t.is(bboxByline.left, bboxSource.left);
    t.is(bboxSource.top - bboxByline.bottom, 5);
});

test('footer-left: custom item alignment with flex-row', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                describe: { 'source-name': 'Source Name', byline: 'Foo' }
            }
        },
        themeData: {
            options: {
                footer: { left: { layout: 'flex-row', alignItems: 'flex-end' } }
            }
        }
    });
    t.is(await getElementStyle(page, '.footer-left', 'align-items'), 'flex-end');
});

test('footer-center: flex-column is center aligned', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                describe: { 'source-name': 'Source Name', byline: 'Foo' }
            }
        },
        themeData: {
            options: {
                blocks: { source: { region: 'footerCenter' }, byline: { region: 'footerCenter' } },
                footer: { center: { layout: 'flex-column', gap: 5 } }
            }
        }
    });
    const bboxByline = await getElementBoundingBox(page, '.footer-center .byline-block');
    const bboxSource = await getElementBoundingBox(page, '.footer-center .source-block');
    // check that source and byline are centered
    t.is(
        Math.round(bboxByline.left - bboxSource.left),
        Math.round(bboxSource.right - bboxByline.right)
    );
});

test('footer-center: custom item alignment with flex-row', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                describe: { 'source-name': 'Source Name', byline: 'Foo' }
            }
        },
        themeData: {
            options: {
                blocks: { source: { region: 'footerCenter' }, byline: { region: 'footerCenter' } },
                footer: { center: { layout: 'flex-row', alignItems: 'flex-end' } }
            }
        }
    });
    t.is(await getElementStyle(page, '.footer-center', 'align-items'), 'flex-end');
});

test('footer-right: flex-column is right aligned', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                describe: { 'source-name': 'Source Name', byline: 'Foo' }
            }
        },
        themeData: {
            options: {
                blocks: { source: { region: 'footerRight' }, byline: { region: 'footerRight' } },
                footer: { right: { layout: 'flex-column', gap: 5 } }
            }
        }
    });
    const bboxByline = await getElementBoundingBox(page, '.footer-right .byline-block');
    const bboxSource = await getElementBoundingBox(page, '.footer-right .source-block');
    // check that source and byline are right aligned
    t.is(bboxByline.right, bboxSource.right);
});

test('gap between footer regions', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                describe: { 'source-name': 'Source Name', byline: 'Foo' }
            }
        },
        themeData: {
            options: {
                blocks: { byline: { region: 'footerRight' } },
                footer: { gap: 25 }
            }
        }
    });
    t.is(await getElementStyle(page, '.dw-chart-footer', 'display'), 'flex');
    t.is(await getElementStyle(page, '.dw-chart-footer', 'gap'), '25px');
});
