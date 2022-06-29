const got = require('got');
const Joi = require('joi');

module.exports = {
    name: 'utils/geocode',
    version: '1.0.0',
    register: server => {
        // GET /utils/geocode
        server.route({
            method: 'GET',
            path: '/geocode',
            options: {
                auth: {
                    strategy: 'guest',
                    access: { scope: ['user:read'] }
                },
                description: 'Proxy a request to our geocoder',
                notes: `Requires scope \`user:read\`.`,
                validate: {
                    options: { allowUnknown: true },
                    query: {
                        q: Joi.string().required().description('The actual query to the geocoder'),
                        language: Joi.string().description(
                            'The expected charset of the reply, probably optional'
                        ),
                        bounds: Joi.string().description('Optional boundary parameter')
                    }
                }
            },
            handler: geoCode
        });
    }
};

async function geoCode(request, h) {
    const { openCage } = request.server.methods.config('api');

    const searchParams = request.url.searchParams;
    searchParams.set('key', openCage);

    const res = await got({
        throwHttpErrors: false,
        url: 'https://api.opencagedata.com/geocode/v1/json',
        searchParams
    });

    return h.response(res.body).code(res.statusCode).type(res.headers['content-type']);
}
