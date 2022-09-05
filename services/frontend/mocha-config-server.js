module.exports = {
    spec: './src/routes/**/*.test.*',
    exclude: ['./node_modules/**'],
    require: ['chai/register-expect.js', './tests/helpers/setup-server.mjs'],
    timeout: 10000
};
