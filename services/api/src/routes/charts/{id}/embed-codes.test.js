const test = require('ava');
const {
    addUserToTeam,
    setup,
    withChart,
    withTeam,
    withUser
} = require('../../../../test/helpers/setup');

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
});

test('GET /charts/{id}/embed-codes returns preferred custom code', async t => {
    await withTeam(
        {
            settings: {
                embed: {
                    custom_embed: {
                        text: 'my help',
                        // We test empty title, because the Team Settings UI allows storing them and
                        // because there are probably such titles in the production db.
                        // TODO Change this test to not have empty title, once we update the schema
                        // to forbid such titles.
                        title: '',
                        template: '<b>foo</b>'
                    },
                    preferred_embed: 'custom'
                }
            }
        },
        async team => {
            await withUser(t.context.server, {}, async userObj => {
                const { token, user } = userObj;
                await addUserToTeam(user, team);
                await withChart(
                    {
                        author_id: user.id,
                        organization_id: team.id
                    },
                    async chart => {
                        const res = await t.context.server.inject({
                            method: 'GET',
                            url: `/v3/charts/${chart.id}/embed-codes`,
                            headers: {
                                authorization: `Bearer ${token}`
                            }
                        });
                        t.is(res.statusCode, 200);
                        t.is(res.result.length, 3);
                        t.is(res.result[0].title, 'Responsive iframe');
                        t.is(res.result[1].title, 'Iframe');
                        t.deepEqual(res.result[2], {
                            id: 'custom',
                            preferred: true,
                            code: '<b>foo</b>',
                            text: 'my help',
                            title: '',
                            template: '<b>foo</b>'
                        });
                    }
                );
            });
        }
    );
});
