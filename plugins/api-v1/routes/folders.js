const Boom = require('@hapi/boom');
const { Chart } = require('@datawrapper/orm/models');

function convertResult(result) {
    return {
        id: result.id,
        name: result.name,
        parent: result.parentId,
        organization: result.organizationId !== undefined ? result.organizationId : result.teamId,
        user: result.userId || null
    };
}

module.exports = {
    name: 'api-v1/folders',
    register: async server => {
        server.route({
            method: 'GET',
            path: '/',
            options: {
                auth: {
                    mode: 'required'
                }
            },
            async handler(request) {
                try {
                    const res = await request.server.inject({
                        method: 'GET',
                        url: `/v3/folders?compact`,
                        auth: request.auth,
                        headers: request.headers
                    });
                    if (res.result.message === 'Insufficient scope') {
                        const error = Boom.forbidden('Insufficient scope');
                        error.output.payload.status = 'error';
                        error.output.payload.code = 'access-denied';
                        return error;
                    }
                    if (res.statusCode >= 400) {
                        return {
                            status: 'error',
                            code: res.result.error,
                            message: res.result.message
                        };
                    }

                    return {
                        status: 'ok',
                        data: res.result.list
                    };
                } catch (ex) {
                    server.logger.warn(ex);
                    return { status: 'error', code: 'unknown_error', message: ex };
                }
            }
        });
        server.route({
            method: 'GET',
            path: '/{id}',
            options: {
                auth: {
                    mode: 'required'
                }
            },
            async handler(request) {
                try {
                    const res = await request.server.inject({
                        method: 'GET',
                        url: `/v3/folders/${request.params.id}`,
                        auth: request.auth,
                        headers: request.headers
                    });
                    if (res.result.message === 'Insufficient scope') {
                        const error = Boom.forbidden('Insufficient scope');
                        error.output.payload.status = 'error';
                        error.output.payload.code = 'access-denied';
                        return error;
                    }
                    if (res.statusCode === 404) {
                        const error = Boom.notFound(
                            "You can't access this folder. Folder may not exist."
                        );
                        error.output.payload.status = 'error';
                        error.output.payload.code = 'not-found';
                        return error;
                    }
                    if (res.statusCode >= 400) {
                        return {
                            status: 'error',
                            code: res.result.error,
                            message: res.result.message
                        };
                    }

                    return {
                        status: 'ok',
                        data: convertResult(res.result)
                    };
                } catch (ex) {
                    server.logger.warn(ex);
                    return { status: 'error', code: 'unknown_error', message: ex };
                }
            }
        });
        server.route({
            method: 'POST',
            path: '/',
            options: {
                auth: {
                    mode: 'required'
                }
            },
            async handler(request) {
                try {
                    const res = await request.server.inject({
                        method: 'POST',
                        url: `/v3/folders`,
                        auth: request.auth,
                        headers: request.headers,
                        payload: {
                            name: request.payload.name,
                            organizationId: request.payload.organization,
                            parentId: request.payload.parent
                        }
                    });
                    if (res.result.message === 'Insufficient scope') {
                        const error = Boom.forbidden('Insufficient scope');
                        error.output.payload.status = 'error';
                        error.output.payload.code = 'access-denied';
                        return error;
                    }
                    if (
                        res.result.message === 'Invalid request payload input: "name" is required'
                    ) {
                        return { status: 'error', code: 'need-name', message: res.result.message };
                    }
                    if (
                        res.result.message ===
                        'User does not have access to the specified parent folder, or it does not exist.'
                    ) {
                        return {
                            status: 'error',
                            code: 'parent-invalid',
                            message: res.result.message
                        };
                    }
                    if (res.result.message === 'User does not have access to the specified team.') {
                        return {
                            status: 'error',
                            code: 'org-invalid',
                            message: res.result.message
                        };
                    }
                    if (res.result.message === 'A folder with that name already exists.') {
                        return {
                            status: 'error',
                            code: 'duplicate-name',
                            message: res.result.message
                        };
                    }
                    if (res.statusCode >= 400) {
                        return {
                            status: 'error',
                            code: res.result.error,
                            message: res.result.message
                        };
                    }

                    return {
                        status: 'ok',
                        data: convertResult(res.result)
                    };
                } catch (ex) {
                    server.logger.warn(ex);
                    return { status: 'error', code: 'unknown_error', message: ex };
                }
            }
        });
        server.route({
            method: 'PUT',
            path: '/{id}',
            options: {
                auth: {
                    mode: 'required'
                }
            },
            async handler(request) {
                try {
                    const res = await request.server.inject({
                        method: 'PATCH',
                        url: `/v3/folders/${request.params.id}`,
                        auth: request.auth,
                        headers: request.headers,
                        payload: {
                            name: request.payload.name,
                            userId: request.payload.user,
                            parentId:
                                request.payload.parent === false ? null : request.payload.parent,
                            teamId: request.payload.organization
                        }
                    });
                    if (res.result.message === 'Insufficient scope') {
                        const error = Boom.forbidden('Insufficient scope');
                        error.output.payload.status = 'error';
                        error.output.payload.code = 'access-denied';
                        return error;
                    }
                    if (
                        res.result.message?.includes(
                            "Team does not exist or you don't have access to it."
                        )
                    ) {
                        return {
                            status: 'error',
                            code: 'org-invalid',
                            message: res.result.message
                        };
                    }
                    if (res.result.message === 'A folder with this name already exists.') {
                        return {
                            status: 'error',
                            code: 'duplicate-name',
                            message: res.result.message
                        };
                    }
                    if (
                        res.result.message ===
                        "The parent folder does not exist or you don't have access to it."
                    ) {
                        return {
                            status: 'error',
                            code: 'parent-invalid',
                            message: res.result.message
                        };
                    }
                    if (res.result.message === 'A folder cannot be the parent of itself.') {
                        return {
                            status: 'error',
                            code: 'move-folder-inside-itself',
                            message: res.result.message
                        };
                    }
                    if (res.result.message === "You can't move a folder into its own subtree.") {
                        return {
                            status: 'error',
                            code: 'move-folder-inside-substree',
                            message: res.result.message
                        };
                    }
                    if (res.statusCode === 404) {
                        return {
                            status: 'error',
                            code: 'not-found',
                            message: res.result.message
                        };
                    }
                    if (res.statusCode >= 400) {
                        return {
                            status: 'error',
                            code: res.result.error,
                            message: res.result.message
                        };
                    }

                    if (request.payload.add) {
                        const chartIds = [];
                        const user = request.auth.artifacts;
                        for (const chartId of request.payload.add) {
                            const chart = await Chart.findByPk(chartId);
                            if (chart && (await chart.isEditableBy(user, request.session))) {
                                chartIds.push(chartId);
                            }
                        }
                        await request.server.inject({
                            method: 'PATCH',
                            url: `/v3/charts`,
                            auth: request.auth,
                            headers: request.headers,
                            payload: {
                                ids: chartIds,
                                patch: {
                                    folderId: res.result.id
                                }
                            }
                        });
                    }

                    return {
                        status: 'ok',
                        data: convertResult(res.result)
                    };
                } catch (ex) {
                    server.logger.warn(ex);
                    return { status: 'error', code: 'unknown_error', message: ex };
                }
            }
        });
        server.route({
            method: 'DELETE',
            path: '/{id}',
            options: {
                auth: {
                    mode: 'required'
                }
            },
            async handler(request) {
                try {
                    const res = await request.server.inject({
                        method: 'DELETE',
                        url: `/v3/folders/${request.params.id}`,
                        auth: request.auth,
                        headers: request.headers
                    });
                    if (res.result?.message === 'Insufficient scope') {
                        const error = Boom.forbidden('Insufficient scope');
                        error.output.payload.status = 'error';
                        error.output.payload.code = 'access-denied';
                        return error;
                    }
                    if (res.result?.message === 'Cannot delete a folder with sub-folders.') {
                        return {
                            status: 'error',
                            code: 'has-subfolders',
                            message: res.result.message
                        };
                    }
                    if (res.statusCode === 404) {
                        return {
                            status: 'error',
                            code: 'not-found',
                            message: res.result.message
                        };
                    }
                    if (res.statusCode >= 400) {
                        return {
                            status: 'error',
                            code: res.result.error,
                            message: res.result.message
                        };
                    }

                    return { status: 'ok' };
                } catch (ex) {
                    server.logger.warn(ex);
                    return { status: 'error', code: 'unknown_error', message: ex };
                }
            }
        });
    }
};
