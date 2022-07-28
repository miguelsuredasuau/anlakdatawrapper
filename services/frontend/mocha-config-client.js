module.exports = {
    spec: 'build/bundle-tests.js',
    require: [
        'chai/register-expect.js',
        'chai/register-should.js',
        './test/helpers/setup-browser-env.mjs',
        'source-map-support/register'
    ]
};
