const Joi = require('joi');
const Boom = require('@hapi/boom');
const { decamelize, camelize } = require('humps');
const assign = require('assign-deep');
const {
    Chart,
    Team,
    User,
    UserTeam,
    Folder,
    TeamProduct,
    TeamTheme,
    withTransaction
} = require('@datawrapper/orm/db');

const { noContentResponse, teamResponse } = require('../../../utils/schemas.js');

const { ROLE_MEMBER, ROLE_OWNER, convertKeys, getMemberRole } = require('../utils');

module.exports = {
    name: 'routes/teams/{id}',
    version: '1.0.0',
    register(server, options) {
        // GET /v3/teams/{id}
        server.route({
            method: 'GET',
            path: `/`,
            options: {
                tags: ['api'],
                description: 'Fetch team information',
                notes: `Requires scope \`team:read\` or \`team:write\`.`,
                auth: {
                    access: { scope: ['team:read', 'team:write'] }
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string().required().description('ID of the team to fetch.')
                    })
                },
                response: teamResponse
            },
            handler: getTeam
        });

        // DELETE /v3/teams/{id}
        server.route({
            method: 'DELETE',
            path: `/`,
            options: {
                tags: ['api'],
                description: 'Delete a team',
                notes: `**Be careful!** This is a destructive action that can only be performed by team owners. Requires scope \`team:write\`.`,
                auth: {
                    access: { scope: ['team:write'] }
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string().required().description('ID of the team to delete.')
                    })
                },
                response: noContentResponse
            },
            handler: deleteTeam
        });

        // PATCH /v3/teams/{id}
        server.route({
            method: 'PATCH',
            path: `/`,
            options: {
                tags: ['api'],
                description: 'Update a team',
                notes: `Requires scope \`team:write\`.`,
                auth: {
                    access: { scope: ['team:write'] }
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string().required().description('Team ID')
                    }),
                    payload: Joi.object({
                        name: Joi.string().example('New Revengers'),
                        defaultTheme: Joi.string().example('light'),
                        settings: Joi.object({}).unknown(true)
                    })
                },
                response: teamResponse
            },
            handler: editTeam
        });

        // PUT /v3/teams/{id}
        server.route({
            method: 'PUT',
            path: `/`,
            options: {
                tags: ['api'],
                description: 'Update a team',
                notes: `Requires scope \`team:write\`.`,
                auth: {
                    access: { scope: ['team:write'] }
                },
                validate: {
                    params: Joi.object({
                        id: Joi.string().required().description('Team ID')
                    }),
                    payload: Joi.object({
                        name: Joi.string().example('New Revengers'),
                        defaultTheme: Joi.string().example('light'),
                        settings: Joi.object({}).unknown(true)
                    })
                },
                response: teamResponse
            },
            handler: editTeam
        });

        require('./invites')(server, options);
        require('./members')(server, options);
        require('./products')(server, options);
    }
};

async function getTeam(request) {
    const { url, server, auth, params } = request;

    const isAdmin = server.methods.isAdmin(request);
    const user = auth.artifacts;
    const hasTeam = await user.hasActivatedTeam(params.id);

    if (!hasTeam && !isAdmin) {
        return Boom.unauthorized();
    }

    const options = {
        include: [
            {
                model: User,
                attributes: ['id', 'email', 'name']
            }
        ],
        where: {
            id: params.id
        }
    };

    const team = await Team.findOne(options);

    if (!team) {
        return Boom.notFound();
    }

    const { users, settings: settingsOrNull, ...data } = team.dataValues;

    const memberRole = hasTeam ? await getMemberRole(auth.artifacts.id, params.id) : undefined;
    const owner = users.find(u => u.user_team.team_role === ROLE_OWNER);

    const res = convertKeys(
        {
            ...data,
            memberCount: users.length,
            role: memberRole,
            url: url.pathname
        },
        camelize
    );

    if (isAdmin || memberRole !== ROLE_MEMBER) {
        const settings = settingsOrNull || {};

        // apply default feature flags
        const defaultFlags = {};
        for (const flag of server.app.featureFlags.values()) {
            defaultFlags[flag.id] = flag.default;
        }
        settings.flags = assign(defaultFlags, settings.flags);

        return {
            ...res,
            settings,
            owner: owner
                ? {
                      id: owner.id,
                      email: owner.email
                  }
                : null
        };
    }
    return res;
}

async function editTeam(request) {
    const { auth, payload, params, server, method } = request;
    const { event, events } = server.app;
    const isAdmin = server.methods.isAdmin(request);
    if (!isAdmin) {
        const memberRole = await getMemberRole(auth.artifacts.id, params.id);

        if (memberRole === ROLE_MEMBER) {
            return Boom.unauthorized();
        }
    }

    let data = {
        name: payload.name,
        settings: payload.settings,
        disabled: payload.disabled,
        defaultTheme: payload.defaultTheme
    };

    const team = await Team.findByPk(params.id);

    if (!team) return Boom.notFound();

    // allow plugins to filter team settings
    const readOnlySettings = (
        await events.emit(event.TEAM_SETTINGS_FILTER, {
            payload: data,
            team,
            user: auth.artifacts,
            isAdmin
        })
    )
        .filter(d => d.status === 'success')
        .map(d => d.data);

    if (typeof data.settings === 'string') {
        data.settings = JSON.parse(data.settings);
    }

    if (method === 'patch') {
        // merge with existing data
        data.settings = assign(team.dataValues.settings, data.settings);
    }

    if (method === 'put') {
        // retain any data not editable by user
        readOnlySettings.forEach(result => {
            data.settings = assign(result.settings, data.settings);
        });
    }

    await Team.update(convertKeys(data, decamelize), {
        where: {
            id: team.id
        },
        limit: 1
    });

    await team.reload();

    data = team.dataValues;

    data.updatedAt = new Date().toISOString();

    return convertKeys(data, camelize);
}

async function deleteTeam(request, h) {
    const { auth, params, server } = request;

    if (!server.methods.isAdmin(request)) {
        const memberRole = await getMemberRole(auth.artifacts.id, params.id);

        if (memberRole !== ROLE_OWNER) {
            return Boom.unauthorized();
        }
    }

    const destroyedRows = await withTransaction(async t => {
        const query = {
            where: {
                organization_id: params.id
            },
            transaction: t
        };

        await Promise.all([
            // remove all relations to this team
            UserTeam.destroy(query),
            TeamProduct.destroy(query),
            TeamTheme.destroy(query),
            // move charts back to their owners
            Chart.update(
                {
                    organization_id: null,
                    in_folder: null
                },
                query
            ),
            // remove relations between folders, so that we can destroy them without triggering
            // foreign key constraint error
            Folder.update(
                {
                    parent_id: null
                },
                {
                    where: {
                        org_id: params.id
                    },
                    transaction: t
                }
            )
        ]);

        // remove team folders
        await Folder.destroy({
            where: {
                org_id: params.id
            },
            transaction: t
        });

        return await Team.destroy({
            where: {
                id: params.id
            },
            transaction: t
        });
    });

    /* no rows got updated, which means the team is already deleted or doesn't exist */
    if (!destroyedRows) {
        return Boom.notFound();
    }

    return h.response().code(204);
}
