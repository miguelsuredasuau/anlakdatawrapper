const { Chart, Team, User } = require('@datawrapper/orm/models');
const { db } = require('@datawrapper/orm');
const { getUserData } = require('@datawrapper/orm/utils/userData');
const uniq = require('lodash/uniq');
const get = require('lodash/get');
const flatten = require('lodash/flatten');
const { byOrder } = require('../utils');
const Joi = require('joi');

module.exports = {
    name: 'routes/dashboard',
    version: '1.0.0',
    register: async server => {
        const config = server.methods.config('frontend');

        const sidebarBoxFunctions = [];

        server.method('registerDashboardSidebarBoxes', func => {
            sidebarBoxFunctions.push(func);
        });

        const numCharts = 9;

        server.methods.registerDashboardSidebarBoxes(async request => {
            const user = request.auth.artifacts;
            const pendingTeams = await getPendingTeams(user.id);
            const changelogUrl = get(config, 'dashboard.changelog.url');
            const changelogFeed = get(config, 'dashboard.changelog.feed');

            return [
                {
                    order: 10,
                    component: 'dashboard/sidebar/active-team'
                },
                {
                    order: 20,
                    component: 'dashboard/sidebar/email-activation'
                },
                ...((await needsEmailSetup(user.id))
                    ? [
                          {
                              order: 30,
                              component: 'dashboard/sidebar/email-setup'
                          }
                      ]
                    : []),
                ...(pendingTeams.length
                    ? [
                          {
                              order: 40,
                              component: 'dashboard/sidebar/pending-invites',
                              props: {
                                  pendingTeams
                              }
                          }
                      ]
                    : []),
                ...(changelogUrl && changelogFeed
                    ? [
                          {
                              order: 90,
                              component: 'dashboard/sidebar/changelog',
                              props: {
                                  changelogUrl,
                                  changelogFeed
                              }
                          }
                      ]
                    : [])
            ];
        });

        server.route({
            method: 'GET',
            path: '/',
            options: {
                auth: 'user',
                validate: {
                    query: Joi.object().keys({
                        c: Joi.string().optional(),
                        t: Joi.string().optional(),
                        m: Joi.string().optional()
                    })
                },
                async handler(request, h) {
                    if (request.query.c) {
                        // forward legacy charts
                        return h.redirect(
                            `https://datawrapper.dwcdn.net/legacy/${request.query.c}.html`
                        );
                    }

                    const user = request.auth.artifacts;

                    const recentlyEditedIds = JSON.parse(
                        await getUserData(user.id, 'recently_edited', '[]')
                    );
                    const recentlyPublishedIds = JSON.parse(
                        await getUserData(user.id, 'recently_published', '[]')
                    );

                    if (recentlyEditedIds.length < numCharts) {
                        const fb = await Chart.findAll({
                            attributes: ['id'],
                            where: {
                                author_id: user.id,
                                deleted: false
                            },
                            order: [['last_modified_at', 'DESC']],
                            limit: 30
                        });
                        fb.forEach(({ id }) => recentlyEditedIds.push(id));
                    }

                    if (recentlyPublishedIds.length < numCharts) {
                        const fb = await Chart.findAll({
                            attributes: ['id'],
                            where: {
                                author_id: user.id,
                                deleted: false,
                                published_at: { [db.Op.not]: null }
                            },
                            order: [['published_at', 'DESC']],
                            limit: 30
                        });
                        fb.forEach(({ id }) => recentlyPublishedIds.push(id));
                    }

                    const sidebarBoxes = flatten(
                        await Promise.all(
                            sidebarBoxFunctions.map(controller => controller(request))
                        )
                    )
                        .map(d => ({ props: {}, ...d }))
                        .sort(byOrder);

                    return h.view('dashboard/Index.svelte', {
                        htmlClass: 'has-background-white-bis',
                        props: {
                            sidebarBoxes,
                            notification:
                                request.query.m && request.query.t
                                    ? {
                                          message: request.query.m,
                                          type: request.query.t
                                      }
                                    : undefined,
                            recentlyEdited: await getCharts(
                                uniq(recentlyEditedIds).slice(0, numCharts * 2),
                                'last_modified_at'
                            ),
                            recentlyPublished: await getCharts(
                                uniq(recentlyPublishedIds).slice(0, numCharts * 2),
                                'published_at'
                            )
                        }
                    });
                }
            }
        });

        async function getCharts(chartIds, order) {
            return (
                await Chart.findAll({
                    where: {
                        id: chartIds,
                        deleted: false
                    },
                    order: [[order, 'DESC']],
                    limit: numCharts
                })
            ).map(c => {
                const { id, type, theme, title, last_modified_at, published_at } = c.toJSON();
                const thumbnailHash = c.getThumbnailHash();
                return { id, type, theme, title, thumbnailHash, last_modified_at, published_at };
            });
        }

        async function getPendingTeams(userId) {
            const userTeams = await Team.findAll({
                include: [
                    {
                        model: User,
                        where: { id: userId },
                        through: {
                            attributes: ['invite_token', 'invited_by'],
                            where: {
                                invite_token: { [User.sequelize.Op.ne]: '' }
                            }
                        }
                    }
                ],
                limit: 10
            });

            return Promise.all(
                userTeams.map(async ({ id, name, users: [user] }) => {
                    const invitedBy = await User.findOne({
                        where: {
                            id: user.user_team.invited_by,
                            deleted: false
                        }
                    });
                    return {
                        id,
                        name,
                        token: user.user_team.invite_token,
                        invitedBy: invitedBy && {
                            name: invitedBy.email || `"${invitedBy.name}"`,
                            url: invitedBy.sm_profile
                        }
                    };
                })
            );
        }

        async function needsEmailSetup(userId) {
            const user = await User.findByPk(userId);
            return user && user.oauth_signin !== '' && user.email === '';
        }
    }
};
