const baseConfig = require('./config.docker.js');

module.exports = {
    ...baseConfig,
    plugins: {
        'api-v1': {},
        basemaps: {
            'basemaps-path': 'src/tests/basemaps',
            'webhook-token': 'my-token'
        },
        'chart-data-s3': {
            s3: {
                endpoint: 'https://www.example.com/',
                access_key_id: 'fake',
                secret_access_key: 'fake',
                buckets: [
                    {
                        bucket: 'my bucket',
                        path: 'my/path'
                    },
                    {
                        bucket: 'my secondary bucket'
                    }
                ]
            }
        },
        'export-pdf': {},
        'external-data': {
            s3: {
                endpoint: 'https://www.example.com/',
                access_key_id: 'fake',
                secret_access_key: 'fake',
                bucket: 'fake',
                prefix: 'data'
            }
        },
        river: {}
    }
};
