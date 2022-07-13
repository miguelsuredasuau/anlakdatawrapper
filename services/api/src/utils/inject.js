const Boom = require('@hapi/boom');

async function injectSafe(request, opts) {
    const res = await request.server.inject(opts);
    if (res.statusCode >= 400) {
        if (request.sentryScope) {
            request.sentryScope.setExtra('statusCode', res.statusCode);
            request.sentryScope.setExtra('result', res.result);
        }
        request.log(['sentry'], new Error('Injected request failed'));
        throw new Boom.Boom(res.result.message, { statusCode: res.result.statusCode });
    }
    return res;
}

module.exports = injectSafe;
