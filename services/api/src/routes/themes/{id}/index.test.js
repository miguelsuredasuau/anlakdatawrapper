const test = require('ava');
const { createUser, destroy, setup } = require('../../../../test/helpers/setup');
const { darkModeTestTheme, darkModeTestBgTheme } = require('../../../../test/data/testThemes.js');
const { findDarkModeOverrideKeys } = require('./utils');

function getDarkTheme(t, themeId) {
    return t.context.server.inject({
        method: 'GET',
        url: `/v3/themes/${themeId}?dark=true`,
        auth: t.context.auth
    });
}

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
    t.context.userObj = await createUser(t.context.server);
    t.context.auth = {
        strategy: 'session',
        credentials: t.context.userObj.session,
        artifacts: t.context.userObj.user
    };
    const { Theme } = require('@datawrapper/orm/models');
    t.context.themes = await Promise.all([
        await Theme.findOrCreate({
            where: { id: 'my-theme-1' },
            defaults: {
                title: 'Test Theme',
                data: { test: 'test', deep: { key: [1, 2, 3] } },
                less: 'h1 { z-index: 1 }',
                assets: {}
            }
        }),
        await Theme.findOrCreate({
            where: { id: 'my-theme-2' },
            defaults: {
                title: 'Test Theme 2',
                data: { test: 'test', deep: { key: [3, 4, 5] } },
                extend: 'my-theme-1',
                less: 'h1 { z-index: 2 }',
                assets: { key1: 1, key2: { deep: true } }
            }
        }),
        await Theme.findOrCreate({
            where: { id: 'my-theme-3' },
            defaults: {
                title: 'Test Theme 3',
                data: { test: 'test3' },
                extend: 'my-theme-2',
                less: 'h1 { z-index: 3 }',
                assets: {
                    key1: 1,
                    key2: { blue: false },
                    Roboto: {
                        type: 'font',
                        import: 'https://static.dwcdn.net/css/roboto.css',
                        method: 'import'
                    }
                }
            }
        }),
        await Theme.findOrCreate({
            where: { id: 'my-theme-4' },
            defaults: {
                title: 'Test Theme 4',
                data: { test: 'test4' },
                extend: 'my-theme-2',
                less: 'h1 { z-index: 3 }',
                assets: {
                    Roboto: {
                        type: 'font',
                        import: 'https://static.dwcdn.net/css/roboto.css',
                        method: 'import'
                    }
                }
            }
        }),
        await Theme.findOrCreate({
            where: { id: 'my-theme-5' },
            defaults: {
                title: 'Test Theme 5',
                data: {},
                less: '',
                assets: {}
            }
        }),
        await Theme.findOrCreate({
            where: { id: 'test-dark-mode-1' },
            defaults: {
                extend: 'my-theme-1',
                title: 'Test dark mode',
                data: darkModeTestTheme,
                less: '',
                assets: {}
            }
        }),
        await Theme.findOrCreate({
            where: { id: 'test-dark-mode-2' },
            defaults: {
                extend: 'my-theme-1',
                title: 'Test dark mode background',
                data: darkModeTestBgTheme,
                less: '',
                assets: {}
            }
        })
    ]);
});

test.after.always(async t => {
    if (t.context.themes) {
        await destroy(...t.context.themes);
    }
});

test('Should be possible to get theme data', async t => {
    const res = await t.context.server.inject({
        method: 'GET',
        url: '/v3/themes/my-theme-3',
        auth: t.context.auth
    });

    /* remove creation date or snapshots will fail all the time */
    delete res.result.createdAt;
    t.snapshot(res.result);
});

test('Should be possible to get theme font', async t => {
    const res = await t.context.server.inject({
        method: 'GET',
        url: '/v3/themes/my-theme-4',
        auth: t.context.auth
    });

    t.is(res.result.fontsCSS, '@import "https://static.dwcdn.net/css/roboto.css";');
});

test('Should be possible to get extended theme data', async t => {
    const res = await t.context.server.inject({
        method: 'GET',
        url: '/v3/themes/my-theme-3?extend=true',
        auth: t.context.auth
    });

    const theme = res.result;

    /* check that assets are shallow merged when extending */
    t.is(theme.assets.key2.deep, undefined);
    t.is(theme.assets.key2.blue, false);
    /* check if deep key from my-theme-2 was merged correctly */
    t.deepEqual(theme.data.deep.key, [3, 4, 5]);
    t.snapshot(theme.less);
    t.snapshot(theme.data);
});

function constructFormData(items) {
    const boundary = '----WebKitFormBoundaryz3uxR8Q4f0aAu3nl';
    const payload =
        items
            .map(
                ([key, val]) =>
                    `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}`
            )
            .join('\r\n') + `\r\n--${boundary}--\r\n`;

    return { contentType: `multipart/form-data; boundary=${boundary}`, payload };
}

test("Should be possible to upload a fonts by url that doesn't include all font formats", async t => {
    const { contentType, payload } = constructFormData([
        ['font-upload-method', 'url'],
        ['font-name', 'Roboto'],
        ['font-url-woff', 'https://static.dwcdn.net/css/fonts/roboto/roboto_400.woff'],
        ['font-url-ttf', 'https://static.dwcdn.net/css/fonts/roboto/roboto_400.ttf']
    ]);
    const res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/themes/my-theme-3/font',
        auth: t.context.auth,
        headers: {
            'Content-Type': contentType
        },
        payload
    });

    t.is(res.statusCode, 200);
});

test("Shouldn't be possible to upload a font that doesn't include woff or woff2", async t => {
    const { contentType, payload } = constructFormData([
        ['font-upload-method', 'url'],
        ['font-name', 'Roboto'],
        ['font-url-ttf', 'https://static.dwcdn.net/css/fonts/roboto/roboto_400.ttf']
    ]);
    const res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/themes/my-theme-3/font',
        auth: t.context.auth,
        headers: {
            'Content-Type': contentType
        },
        payload
    });

    t.is(res.statusCode, 400);
});

test('Should be possible to upload a font that includes woff2 only', async t => {
    const { contentType, payload } = constructFormData([
        ['font-upload-method', 'url'],
        ['font-name', 'Roboto'],
        ['font-url-woff2', 'https://static.dwcdn.net/css/fonts/roboto/roboto_400.woff2']
    ]);
    const res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/themes/my-theme-3/font',
        auth: t.context.auth,
        headers: {
            'Content-Type': contentType
        },
        payload
    });

    t.is(res.statusCode, 200);
});

test('style.body.background overwritten with colors.background color where apprioriate', async t => {
    const res = await getDarkTheme(t, 'test-dark-mode-2');
    const data = res.result.data;

    // style.body.background does not get overwritten when transparent
    t.is(data.colors.background, '#191919');
    t.is(data.style.body.background, 'transparent');

    darkModeTestBgTheme.style.body.background = 'rgb(255, 255, 255)';

    const res2 = await t.context.server.inject({
        method: 'PATCH',
        url: '/v3/themes/test-dark-mode-2',
        payload: { data: darkModeTestBgTheme },
        auth: t.context.auth
    });

    t.is(res2.statusCode, 200);

    const res3 = await getDarkTheme(t, 'test-dark-mode-2');
    const data2 = res3.result.data;

    // but it does when it's the same color as colors.background
    t.is(data2.colors.background, '#191919');
    t.is(data2.style.body.background, '#191919');
});

test('findDarkModeOverrideKeys identifies keys within schema items of type link', async t => {
    const colorKeys = await findDarkModeOverrideKeys();

    const blocksColorKeys = colorKeys
        .map(d => d.path)
        .filter(path => path.match(/^options\.blocks/));

    const expected = [
        'options.blocks.logo.data.options',
        'options.blocks.hr.data.border',
        'options.blocks.hr1.data.border',
        'options.blocks.hr2.data.border',
        'options.blocks.svg-rule.data.color',
        'options.blocks.svg-rule1.data.color',
        'options.blocks.svg-rule2.data.color'
    ];

    t.deepEqual(blocksColorKeys, expected);
});

test('findDarkModeOverrideKeys finds keys nested in arrays', async t => {
    // test theme is valid
    await t.context.server.methods.validateThemeData(darkModeTestTheme);
    const colorKeys = await findDarkModeOverrideKeys({ data: darkModeTestTheme });
    const colorKeyPaths = colorKeys.map(d => d.path);

    [
        'options.blocks.logo.data.options.0.imgSrc',
        'options.blocks.logo.data.options.1.imgSrc',
        'vis.locator-maps.mapStyles.0.colors.land',
        'vis.locator-maps.mapStyles.0.layers.water.paint.fill-color',
        'colors.gradients.0.0',
        'colors.categories.0.0',
        'colors.palette.0'
    ].forEach(path => {
        t.is(colorKeyPaths.includes(path), true);
    });

    //  color arrays don't get mapped by array, but by individual items
    ['colors.gradients.0', 'colors.categories.0', 'colors.palette'].forEach(path => {
        t.is(colorKeyPaths.includes(path), false);
    });
});

test('Dark mode overrides work as expected', async t => {
    const res = await t.context.server.inject({
        method: 'GET',
        url: '/v3/themes/test-dark-mode-1?dark=true',
        auth: t.context.auth
    });

    t.is(res.statusCode, 200);

    const data = res.result.data;

    // specific override has been applied
    t.is(data.colors.palette[1], '#00ff00');

    // automatic conversion has been applied to remaining colors
    t.not(data.colors.palette[0], darkModeTestTheme.colors.palette[0]);
    t.not(data.colors.palette[2], darkModeTestTheme.colors.palette[2]);

    // color keys with 'noDarkModeInvert' don't get inverted
    t.is(data.vis['locator-maps'].mapStyles[0].colors.land, '#ffffff');

    // non-color items with overrideSupport: ['darkMode'] can be overwritten
    t.is(data.options.blocks.logo.data.options[0].imgSrc, 'https://domain/logo-white.png');

    // gradient has been overwritten
    t.deepEqual(data.colors.gradients[0], ['#ffffff', '#ffff00', '#ff0000']);
});

test('Should be possible to update theme with valid less', async t => {
    const payload = {
        less: '.dw-chart { border: 5px solid red; }'
    };

    const res = await t.context.server.inject({
        method: 'PATCH',
        url: '/v3/themes/my-theme-5',
        auth: t.context.auth,
        headers: {
            'Content-Type': 'application/json'
        },
        payload
    });

    t.is(res.statusCode, 200);
});

test("Shouldn't be possible to update theme with invalid less", async t => {
    const payload = {
        less: '{.dw-chart { border: 5px solid red; }'
    };

    const res = await t.context.server.inject({
        method: 'PATCH',
        url: '/v3/themes/my-theme-5',
        auth: t.context.auth,
        headers: {
            'Content-Type': 'application/json'
        },
        payload
    });

    t.is(res.statusCode, 400);
});
