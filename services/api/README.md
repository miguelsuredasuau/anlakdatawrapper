# @datawrapper/api

This repository contains the Node.js API. It is used to build datawrapper.de, automations and other integrations.
To learn more about, how to use it, go to https://developer.datawrapper.de/docs.

## Table of contents

1. [Server Methods](#server-methods)
1. [Server Application Data](#server-application-data)
1. [Plugins](#plugins)
    1. [Plugin Development](#plugin-development)
    1. [Updating a Plugin](#updating-a-plugin)



## Server Methods

Server methods are a way to provide common utilities throughout the API server. Everywhere you have access to the `server` object (like in request handlers) these methods are available. ([hapi documentation](https://hapi.dev/api/?v=19.1.1#-servermethods))

-   `server.methods.config`
    Provides access to the servers `config.js` properties like `api` or `orm`.
-   `server.methods.comparePassword`
    Check validity of a password against a password hash.
-   `server.methods.createChartWebsite`
    Used by publish route and zip export to create a folder with all assets for a standalone Datawrapper chart.
-   `server.methods.generateToken`
    Generates a unique token/ID with a specified length.
-   `server.methods.getModel`
    Provides access to all registered ORM models (useful for quick access in plugins).
-   `server.methods.hashPassword`
    Hashes a cleartext password with the [`bcrypt`](https://en.wikipedia.org/wiki/Bcrypt) algorithm.
-   `server.methods.isAdmin`
    Checks if a request was initiated by a Datawrapper admin.
-   `server.methods.logAction`
    Logs an action to the `action` database table.
-   `server.methods.registerVisualization`
    Registers a new visualization type usually handled by plugins like `plugin-d3-lines`.
-   `server.methods.getSchemas`
    Returns a Schemas object that provides methods to validate themes, teams etc and to load
    a schema as JSON.
-   `server.methods.registerFeatureFlag`
    Registers a new feature flag

## Server Application Data

Server application data is server specific data that can be accessed everywhere the `server` object is available. ([hapi documentation](https://hapi.dev/api/?v=19.1.1#-serverapp))

-   `server.app.event`
    List of events the server can emit.
-   `server.app.events`
    Event emitter to trigger server events.
-   `server.app.visualizations`
    A map of registered visualizations like `d3-lines`.
-   `server.app.exportFormats`
    A set of export formats the server can process (eg. PDF, png, zip)

## Plugins

The API is extensible to match customers and Datawrappers needs. By default the API has endpoints for basic functionality like user and chart management. This functionality can be extended with the use of plugins. Since the API is built on top of the [Hapi](https://hapijs.com) server framework, it uses [Hapis plugin system](https://hapijs.com/api#plugins). Everything a Hapi plugin can do, an API plugin can, too.

When starting the API server, it will check which plugins are configured in `config.js` and pass the configuration objects to the plugins `register` function with `options.config`. Plugins will have access to ORM models through `options.models`.

### Plugin Development

In its simplest form, an API plugin is a node module that exports an object with `name`, `version` and `register` keys.

```js
/* config.js */

plugins: {
    'my-plugin': {
        apiKey: 'agamotto'
    }
}

/* api.cjs */
module.exports = {
    name: 'my-plugin',
    version: '1.0.0',
    register: (server, options) => {
        console.log('hello from my-plugin!')
        console.log(`the api key is "${options.config.apiKey}"`)
        // -> the api key is "agamotto"
    }
}
```

You can use the [`hapijs` plugin options](https://hapi.dev/api/?v=19.1.1#-await-serverregisterplugins-options) to prefix all routes defined in your plugin (to avoid repeating the prefix again and again):

```js
/* api.cjs */
module.exports = {
    name: 'my-plugin',
    version: '1.0.0',
    options: {
        routes: {
            prefix: '/plugins/my-plugin'
        }
    },
    register: (server, options) => {
        server.route({
            method: 'GET',
            path: '/hello', // Route will be `/v3/plugins/my-plugin/hello`
            config: { auth: false, tags: ['api', 'plugin'] },
            handler: (request, h) => {
                return { data: 'Hello from plugin' };
            }
        });
    }
};
```

> **The server will crash during start, if a route is already defined!**

### Updating a Plugin

> This guide is for updating a plugin in a server environment (_staging_, _production_).

The easiest way to fully update is by connecting to the server with ssh and navigating to the desired plugins location. There you can pull the latest changes with (eg. `git pull`) and then restart the running API server with PM2.

**This way of updating is necessary every time the server code of a plugin changes (usually located in `api.cjs`).**

Some plugins register visualizations and provide static assets like JS and CSS to render charts. If only the static assets change, a full server restart is not necessary. In this case, the API provides admin endpoints to update the static files of a plugin. By calling `POST /v3/admin/plugins/update` with the name and branch of the plugin `{ "name": "d3-lines", "branch": "master" }`, the API will download the new static files and replace them. Now the new files are served and used for chart previews and publishing. The following folders inside a plugins directory will get replaced: `less/, locale/, static/`.

> **Note**: The process of updating only static files is not ideal and could cause inconsistent states in the API server. In practice this should not be a problem.
>
> With our implementation of zero downtime API reloads, thanks to PM2, we should be able to programmatically trigger full plugin updates in the future. So far our special case for visualizations solves the problem.

### Development

#### Unit tests

To run the unit tests, run:

```shell
make test
```

or to run only some tests:

```shell
make test m='chart has*'
```

This will start a Docker container with a testing database, create tables in it, and run the unit
tests in another container.

The database container will keep running after the tests finish, so you can run `make test`
repeatedly and it will save some time by reusing the database and its tables.

When you're done developing the unit tests, or when you change database schema, you can stop the
database Docker container and delete the database using:

```shell
make test-teardown
```

##### Linking npm packages into unit tests

If you'd like to run the unit tests with a linked npm package, mount it as a readonly Docker volume
in the Makefile target `test-run` like this:

```makefile
test-run:  ## Run command specified by the variable 'cmd' in the testing node container
	$(docker_compose) run --rm \
		-e "DW_CONFIG_PATH=$(DW_CONFIG_PATH)" \
		-e "NODE_ENV=test" \
        -v "$$(pwd)/../../libs/orm:/app/node_modules/@datawrapper/orm:ro" \
		node $(cmd)
```
