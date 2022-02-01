import { register } from './settings-pages.js';

const fakeServer = function () {
    this.app = {};
    this.methods = {};
};

fakeServer.prototype.method = function (name, func) {
    this.methods[name] = func;
};

describe('settings-pages', function () {
    it('registers and gets pages by specified key', async function () {
        const server = new fakeServer();
        await register(server);
        server.methods.registerSettingsPage('my-key', async function () {
            return { title: 'Foo page', group: 'My group' };
        });
        server.methods.registerSettingsPage('my-key', async function () {
            return { title: 'Bar page', group: 'My group' };
        });
        server.methods.registerSettingsPage('spam-key', async function () {
            return { title: 'Spam page', group: 'My group' };
        });
        const settingsPages = await server.methods.getSettingsPages('my-key');
        expect(settingsPages).to.deep.equal([
            {
                title: 'My group',
                pages: [
                    {
                        title: 'Foo page',
                        group: 'My group',
                        sections: []
                    },
                    {
                        title: 'Bar page',
                        group: 'My group',
                        sections: []
                    }
                ]
            }
        ]);
    });

    it('registers and gets pages with sections', async function () {
        const server = new fakeServer();
        await register(server);
        server.methods.registerSettingsPage('my-key', async function () {
            return { title: 'Foo page', id: 'foo', group: 'My group' };
        });
        server.methods.registerSettingsPage('my-key', async function () {
            return { title: 'Bar page', id: 'bar', group: 'My group' };
        });
        server.methods.registerSettingsSection('my-key', async function () {
            return { title: 'Foo section A', pageId: 'foo', order: 2 };
        });
        server.methods.registerSettingsSection('my-key', async function () {
            return { title: 'Foo section B', pageId: 'foo', order: 1 };
        });
        server.methods.registerSettingsSection('my-key', async function () {
            return { title: 'Bar section', pageId: 'bar' };
        });
        server.methods.registerSettingsSection('my-key', async function () {
            return { title: 'Section with unknown page id', pageId: 'spam' };
        });
        const settingsPages = await server.methods.getSettingsPages('my-key');
        expect(settingsPages).to.deep.equal([
            {
                title: 'My group',
                pages: [
                    {
                        title: 'Foo page',
                        id: 'foo',
                        group: 'My group',
                        sections: [
                            {
                                title: 'Foo section B',
                                pageId: 'foo',
                                order: 1
                            },
                            {
                                title: 'Foo section A',
                                pageId: 'foo',
                                order: 2
                            }
                        ]
                    },
                    {
                        title: 'Bar page',
                        id: 'bar',
                        group: 'My group',
                        sections: [
                            {
                                title: 'Bar section',
                                pageId: 'bar'
                            }
                        ]
                    }
                ]
            }
        ]);
    });

    it('groups pages by group', async function () {
        const server = new fakeServer();
        await register(server);
        server.methods.registerSettingsPage('my-key', async function () {
            return { title: 'Foo page', group: 'First group' };
        });
        server.methods.registerSettingsPage('my-key', async function () {
            return { title: 'Bar page', group: 'First group' };
        });
        server.methods.registerSettingsPage('my-key', async function () {
            return { title: 'Spam page', group: 'Second group' };
        });
        const settingsPages = await server.methods.getSettingsPages('my-key');
        expect(settingsPages).to.deep.equal([
            {
                title: 'First group',
                pages: [
                    {
                        title: 'Foo page',
                        group: 'First group',
                        sections: []
                    },
                    {
                        title: 'Bar page',
                        group: 'First group',
                        sections: []
                    }
                ]
            },
            {
                title: 'Second group',
                pages: [
                    {
                        title: 'Spam page',
                        group: 'Second group',
                        sections: []
                    }
                ]
            }
        ]);
    });

    it('sorts pages and groups by the order property', async function () {
        const server = new fakeServer();
        await register(server);
        server.methods.registerSettingsPage('my-key', async function () {
            return { title: 'Foo page', group: 'Foo group', order: 3 };
        });
        server.methods.registerSettingsPage('my-key', async function () {
            return { title: 'Bar page', group: 'Foo group', order: 2 };
        });
        server.methods.registerSettingsPage('my-key', async function () {
            return { title: 'Spam page', group: 'Bar group', order: 1 };
        });
        const settingsPages = await server.methods.getSettingsPages('my-key');
        expect(settingsPages).to.deep.equal([
            {
                title: 'Bar group',
                pages: [
                    {
                        title: 'Spam page',
                        group: 'Bar group',
                        order: 1,
                        sections: []
                    }
                ]
            },
            {
                title: 'Foo group',
                pages: [
                    {
                        title: 'Bar page',
                        group: 'Foo group',
                        order: 2,
                        sections: []
                    },
                    {
                        title: 'Foo page',
                        group: 'Foo group',
                        order: 3,
                        sections: []
                    }
                ]
            }
        ]);
    });

    it('passes request to the page function', async function () {
        const server = new fakeServer();
        await register(server);
        server.methods.registerSettingsPage('my-key', async function (request) {
            return { title: 'Foo page ' + request, group: 'My group' };
        });
        const settingsPages = await server.methods.getSettingsPages('my-key', 'my-request');
        expect(settingsPages).to.deep.equal([
            {
                title: 'My group',
                pages: [
                    {
                        title: 'Foo page my-request',
                        group: 'My group',
                        sections: []
                    }
                ]
            }
        ]);
    });
});
