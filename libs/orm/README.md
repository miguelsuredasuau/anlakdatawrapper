# datawrapper-orm

A database abstraction layer for Datawrapper

Usage:

Add the package to your repository using:

```
npm i --save "@datawrapper/orm"
```

In your app you need to initialize the ORM before you can actually use it. It's a good idea to do this in your apps main entry point:

```js
const { initORM } = require('@datawrapper/orm');

const { db } = await initORM({
    dialect: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    user: '...',
    password: '...',
    database: '...'
});
```

Note that this will initialize the entire model, which assumes that your database user has access to all the database tables.

Then you can load the models using:

```js
const Chart = db.models.chart
```

or

```js
const { Chart, User } = require('@datawrapper/orm/db');
```

### Plugins

The ORMs functionality can be extended with plugins. This is needed, for example, when new database tables are needed. The plugin API follows the convention of plugins in [datawrapper/api](https://github.com/datawrapper/api#plugins).

A simple ORM plugin that does nothing looks like this:

```js
/* config.js */
plugins: {
    'my-orm-plugin': {
        my_name: 'Steve'
    }
}

/* orm.js */
const { SQ } = require('@datawrapper/orm');

module.exports = {
    register: async ({ db }, config) => {
        console.log(`Hi I am ${config.my_name}!`)
        // logs "Hi I am Steve!" on registration

        db.define(
            'custom_plugin_model',
            {
                id: {
                    type: SQ.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },

                type: SQ.STRING(64),
            },
            {
                tableName: 'custom_plugin_table'
            }
        );
        // defines custom_plugin_model for custom_plugin_table
    }
}
```

`registerPlugins` will register all plugins.

```js
const { registerPlugins } = await initORM()
await registerPlugins();
```

### Development

#### Unit tests

To run the unit tests, run:

``` shell
make test
```

or to run only some tests:

``` shell
make test m='chart has*'
```

This will start a Docker container with a testing database, create tables in it, and run the unit
tests in another container.

The database container will keep running after the tests finish, so you can run `make test`
repeatedly and it will save some time by reusing the database and its tables.

When you're done developing the unit tests, or when you change database schema, you can stop the
database Docker container and delete the database using:

``` shell
make test-teardown
```
