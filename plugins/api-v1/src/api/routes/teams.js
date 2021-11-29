const Boom = require('@hapi/boom');

module.exports = {
    name: 'api-v1/teams',
    register: async server => {
        server.route({
            method: 'GET',
            path: '/user',
            options: {
                auth: {
                    mode: 'required'
                }
            },
            async handler(request) {
                const findEnabledTeamIds = async teamIds => {
                    const Team = request.server.methods.getModel('Team');
                    const db = request.server.methods.getDB();
                    return await db.query(
                        'SELECT id FROM organization WHERE disabled = 0 AND id IN(?)',
                        {
                            type: db.QueryTypes.SELECT,
                            replacements: [teamIds],
                            model: Team
                        }
                    );
                };
                try {
                    const res = await request.server.inject({
                        method: 'GET',
                        url: `/v3/teams`,
                        auth: request.auth,
                        headers: request.headers
                    });
                    if (res.result.message === 'Insufficient scope') {
                        const error = Boom.forbidden('Insufficient scope');
                        error.output.payload.status = 'error';
                        error.output.payload.code = 'access-denied';
                        return error;
                    }

                    const allTeamIds = res.result.list.map(t => t.id);
                    const enabledTeams = await findEnabledTeamIds(allTeamIds);

                    return {
                        status: 'ok',
                        data: enabledTeams.map(t => t.id)
                    };
                } catch (ex) {
                    server.logger.warn(ex);
                    return { status: 'error', code: 'unknown_error', message: 'Unknown error' };
                }
            }
        });
        server.route({
            method: 'GET',
            path: '/{teamId}/charts',
            options: {
                auth: {
                    mode: 'required'
                }
            },
            async handler(request) {
                try {
                    const oldPageSize = 48; // page size in PHP controller
                    const { query } = request;
                    let queryParams = '';
                    if (query.page) {
                        queryParams += `&offset=${encodeURIComponent(query.page * oldPageSize)}`;
                    }
                    if (query.search) {
                        queryParams += `&search=${encodeURIComponent(query.search)}`;
                    }
                    if (!request.auth.credentials.scope.includes('team:read')) {
                        const error = Boom.forbidden('Insufficient scope');
                        error.output.payload.status = 'error';
                        error.output.payload.code = 'access-denied';
                        return error;
                    }
                    const res = await request.server.inject({
                        method: 'GET',
                        url: `/v3/charts?teamId=${encodeURIComponent(
                            request.params.teamId
                        )}&limit=${oldPageSize}&minLastEditStep=1${queryParams}`,
                        auth: request.auth,
                        headers: request.headers
                    });

                    if (res.result.message === 'Not Acceptable') {
                        return {
                            status: 'error',
                            code: 'access-denied',
                            message: res.result.message
                        };
                    }

                    if (res.result.message === 'Insufficient scope') {
                        const error = Boom.forbidden('Insufficient scope');
                        error.output.payload.status = 'error';
                        error.output.payload.code = 'access-denied';
                        return error;
                    }

                    return {
                        status: 'ok',
                        data: {
                            total: res.result.total,
                            charts: res.result.list,
                            page: query.page || 0,
                            numPages: Math.ceil(res.result.total / oldPageSize)
                        }
                    };
                } catch (ex) {
                    server.logger.warn(ex);
                    return { status: 'error', code: 'unknown_error', message: 'Unknown error' };
                }
            }
        });
    }
};
