const got = require('got');

/**
 * Minimal OpenSearch client.
 *
 * It implements basic auth in a way that works in our infrastructure setup, unlike
 * https://github.com/opensearch-project/opensearch-js.
 */
class OpenSearchClient {
    constructor(config) {
        if (!OpenSearchClient.validateConfig(config)) {
            throw new Error('Missing or invalid OpenSearch config');
        }
        this.config = config;
    }

    _call({ method, url, headers, ...rest }) {
        return got({
            method,
            url,
            prefixUrl: `${this.config.protocol}://${this.config.host}:${this.config.port}/${this.config.index}`,
            // Create the 'Authorization' header manually instead of passing 'username' and
            // 'password' to got, because passing these properties results in wrong base64 of
            // the credentials inside the 'Authorization' header, when the password contains
            // special characters. Possibly related to
            // https://github.com/nodejs/node/issues/31439
            headers: {
                ...OpenSearchClient.createBasicAuthHeaders(this.config.user, this.config.password),
                ...headers
            },
            ...rest
        })
            .json()
            .catch(e => {
                if (e.response?.body) {
                    throw new Error(
                        'OpenSearch API call failed: ' +
                            `options=${JSON.stringify(rest.json || rest.body)}, ` +
                            `response=${e.response.body}`
                    );
                }
                throw e;
            });
    }

    _callBulk(statements) {
        const body = statements.map(statement => JSON.stringify(statement)).join('\n') + '\n';
        return this._call({
            method: 'post',
            url: '_bulk?refresh=true',
            headers: {
                'Content-Type': 'application/json'
            },
            body
        });
    }

    search(options) {
        return this._call({
            method: 'post',
            url: '_search',
            json: options
        });
    }

    index(charts) {
        return this._callBulk(charts.flatMap(chart => [{ create: { _id: chart.id } }, chart]));
    }

    delete(charts) {
        if (!charts) {
            return undefined;
        }
        return this._callBulk(charts.map(chart => ({ delete: { _id: chart.id } })));
    }

    async count() {
        const res = await this._call({ url: '_count' });
        return res.count;
    }

    static createBasicAuthHeaders(username, password) {
        if (!username || !password) {
            return {};
        }
        return {
            Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
        };
    }

    static validateConfig(config) {
        return config?.host && config?.protocol && config?.port && config?.index;
    }
}

module.exports = OpenSearchClient;
