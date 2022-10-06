# Datawrapper Frontend

This repository contains the `frontend` service for Datawrapper. It is intended to be run together with other Datawrapper components.

## Usage

We use rollup to compile our Svelte views. The compiled files are stored in `build/view`, from where
they are loaded by the frontend routes (see the [Svelte view adapter](src/utils/svelte-view)).

Therefore, before you start the frontend service, you must run either

```shell
npm run build
```

or

```shell
npm run watch
```

if you want to automatically recompile the views when they change.

## Development

Repository overview:

- [`locale`](locale/) - translation files, automatically updated through the Lokalise API. Run `npm run update-translations` in the monorepo root to update all translations.
- [`src/auth`](src/auth/) - our authentication adapter for Hapi, handles cookie sessions etc.
- [`src/routes`](src/routes/) - controller for the individual frontend routes (e.g. [routes/preview/index.js](src/routes/preview/index.js) for the `GET /preview/:chartid:` route)
- [`src/utils/`](src/utils) - some utilities such as the [plugin loader](src/utils/plugin-loader.js) or our custom [Svelte view adapter](src/utils/svelte-view)
- [`src/views`](src/views) - the view templates (currently we support `pug` and `Svelte3` views)
- [`src/styles`](src/styles) - the LESS sources for `static/datawrapper.css` (use `npm run build:css` to update)
- [`src/server.js`](src/server.js) - where the Hapi Server is created and configured
- [`src/index.js`](src/index.js) - where the Hapi Server is started

## Unit tests

There are two types of unit tests in the frontend project:

- [Client-side unit tests](#client-side-unit-tests)
- [Server-side unit tests](#server-side-unit-tests)

We use the [Mocha](https://mochajs.org/api/mocha) framework for both of the types.

To run all unit tests against a locally running Datawrapper instance, run:

```shell
npm test
```

Or you can run the tests in a docker compose stack that starts its own database and api:

```shell
make test
```

### Client-side unit tests

These unit tests instantiate Svelte components and interact with them. To run them, use:

``` shell
npm run test:client
```

You can pass any [Mocha command line parameters](https://mochajs.org/#command-line-usage) to this
command. For example, to only run the tests for a specific component, you could use the `-f`
(`--fgrep`) option:

```shell
npm run test:client -- -f 'YourComponent'
```

To run the tests in watch mode, you have to run two separate processes. First you make sure the
tests get built with `rollup --watch` using:

```shell
npm run test:client-rollup-watch
```

Then, in a separate terminal, run `mocha` itself:

```shell
npm run test:client-mocha-watch
```

If you only want to test a subset of components, you can set the `TEST` environment variable before
running `test:client-rollup-watch`. Example:

```shell
TEST='views/_partials/controls/*.mjs' npm run test:client-rollup-watch
```

#### Test setup

We use [@testing-library/svelte](https://testing-library.com/docs/svelte-testing-library/api/) and
[chai-dom](https://www.chaijs.com/plugins/chai-dom/) to instantiate Svelte components and interact
with the DOM.

Example setup: [src/views/archive/Index.test.mjs](src/views/archive/Index.test.mjs).

### Server-side unit tests

These unit tests test the frontend hapi server and its routes. They require a running database and
api. Therefore, you have to run them either against a locally running Datawrapper instance:

```shell
npm run test:server
```

Or you can run them in a docker compose environment that starts its own database and api:

```shell
make test-server
```

You can also pass mocha's `-f` option using the `f` argument:

``` shell
make test-server f='YourComponent'
```

A prerequisite for server-side tests is that the frontend views are compiled. See [Usage](#usage)
for the usual compile command. Alternatively, you can do a minimal compilation, which is faster but
creates results that work server-side only:

```shell
npm run test:server-rollup
```

or:

```shell
npm run test:server-rollup-watch
```

## Quick introduction to the new Svelte views

In routes we can use Svelte-templates like this:

```js
// e.g., src/routes/hello-world.js
server.route({
    path: '/',
    method: 'GET',
    async handler(request, h) {
        const props = { name: 'Gregor' };
        return h.view('HelloWorld.svelte', { props });
    }
});
```

The views are simple Svelte3 components that live inside `src/views`

```svelte
<!-- src/views/HelloWorld.svelte -->
<script>
    export let name = 'world';

    function knock() {
        name = 'Who\\'s there?';
    }
</script>

<h1 on:click="{knock}">Hello {name}</h1>
```

You can use the following authentication strategies to specify who can access the route:

- `'user'` - require signed in user, otherwise redirect to signin
- `'admin'` - admin-only route, throw error if accessed by non-admins
- `'guest'` - a valid session is needed (including guest sessions)
- `false` - no restrictions

```jsx
server.route({
    path: '/users-only',
    method: 'GET',
    options: {
        auth: 'user',
        async handler(request, h) {}
    }
});
```

### Server-side rendering + client-side hydration

Each view is compiled twice, so we can render it server-side and then „hydrate“ it client-side. The client-side code is served via `/lib/csr/{file}.svelte.js`.

### View registration

Rollup needs to know which Svelte views exist in the whole frontend and plugins, so that it knows
which files it should compile. We use `server.methods.registerView()` and
`server.methods.registerViewComponent()` to register a view or view component with rollup and
therefore have it compiled when `npm run build` or `npm run watch` runs.

### Layouts

Views want to re-use "layouts". I decided to move all of this logic into Svelte, for maximum flexibility. Meaning, the view component is always the "root" component which imports as many layout components as it wants. Also layouts can "extend" other layouts etc.

```html
<!-- src/views/HelloWorld.svelte -->
<script>
    import AdminPageLayout from 'layouts/AdminPageLayout.svelte';
</script>

<AdminPage title="Hello world">
    <h1>This is the main content</h1>
    <div slot="belowNav">This goes below the nav sidebar</div>
</AdminPage>
```

### Global stores

For "global" variables such as the api domain or information about the signed-in user we don't want to use view props, as they would have to be passed on in too many places. Instead we're using Svelte stores which are accessible through Svelte's `getContext` method.

In `src/utils/svelte-view/context.js` we can define a set of global stores which can be used in any Svelte template via `getContext()`. The initial values are passed to the views as `stores` property.

Svelte views can now use these stores like regular Svelte stores:

```html
<!-- src/views/HellloWorld.svelte -->
<script>
    import { getContext } from 'svelte';
    // all context variables are stores
    const user = getContext('user');
</script>
<h1>Hello { $user.name }</h1>
<p>{__('team / invite / intro')}</p>
```

## Plugins!

Plugins can hook into the frontend service and add their own views or view components. To do so a plugin needs to do two things: provide a `frontend.js` (or `frontend.cjs`, the plugin `package.json` has `type` set to `module`) that acts as hapi plugin interface (similar to our api plugins), and store Svelte views into `src/frontend/views/`.

Example plugin `frontend.cjs`

```jsx
// plugins/example/frontend.cjs
const { version, name } = require('./package.json');

module.exports = {
    name,
    version,
    register: (server, options) => {
        server.route({
            method: 'GET',
            path: '/example',
            async handler(request, h) {
                const props = { test: 'it works' };
                return h.view('_plugins/example/ExampleView.svelte', { props });
            }
        });
    }
};
```

Example plugin `ExampleView.svelte`:

```html
<!-- plugins/example/src/frontend/views/ExampleView.svelte -->
<script type="text/javascript">
    import MainLayout from '_layout/MainLayout.svelte';
    import { user } from 'lib/stores';
    export let test;

    let count = 0;
</script>

<MainLayout title="Example works">
    <div class="container">
        <h1>Example plugin!</h1>
        <p>Hello {$user.name}. The value of <tt>test</tt> is: "{test}"</p>
        <button on:click="{() => count++}">
            {count ? `You clicked me ${count} times!` : 'Click me'}
        </button>
    </div>
</MainLayout>
```

This works because of two changes:

1. when the plugins are loaded during `frontend` server start, the plugins `src/frontend/views` folder is sym-linked to the frontend `src/views/_plugins/{plugin}` path.
2. to allow plugins to use core layouts we added an alias from `layout/*` to the corresponding path in the frontend. Otherwise plugins would have to resolve a long `../../../` path to find the layout folder

![https://user-images.githubusercontent.com/617518/105217547-e9e97c80-5b4b-11eb-859d-a1357958c5c0.gif](https://user-images.githubusercontent.com/617518/105217547-e9e97c80-5b4b-11eb-859d-a1357958c5c0.gif)

### Server-side event hooks

Frontend plugins can not only define routes but also use our event hook system to modify the frontend server. Here's an example of a plugin using a hook to add an entry to the admin pages navigation:

```jsx
// admin-users/frontend.cjs

module.exports = {
    name,
    version,
    async register(server, options) {
        const { events, event } = server.app;

        events.on(event.REGISTER_ADMIN_PAGE, () => ({
            title: 'Users',
            id: 'users',
            group: 'Users',
            icon: 'fa-users',
            order: 1
        }));

    server.route({
            method: 'GET',
            path: '/admin/users',
            //...
```

This is the exact system we’re using in our API server, but I’m open to adjustments.
Frontend plugins
### Translations

To use (dynamic) translations in Svelte views you need to load the `messages` context. Unfortunately Svelte won't trigger DOM updates unless we define our own reactive `__()` method in each view, or pass it around.

```html
<script type="text/javascript">
    import MainLayout from '_layout/MainLayout.svelte';

    export let __;
</script>

<MainLayout title="Hello world">
    <div class="container">
        <p>{ __('team / invite / intro') }</p>
        <button>{ __('dashboard / intro', 'river') }</button>
    </div>
</MainLayout>
```

Behind the scenes, `translate` is using the `messages` store which contains all available translatable strings for the currently active language. By using a store we _could_ even hot swap languages should we decide this is a cool feature.

If you don't want to pass around the `__` method you can also define your own reactive version anywhere you want:

```html
<script>
    import { getContext } from 'svelte';
    const messages = getContext('messages');
    let __;
    $: {
        __ = (key, scope = 'core') => messages.translate(key, scope, $messages);
    }
</script>
```

### Client-side localStorage caching + cookie-based validation

For large and fairly static data like translations

### Svelte 2 adapter

To avoid having to rewrite all our Svelte2 code at once the new frontend includes a Svelte2 adapter which lets us load existing Svelte 2 components.

```jsx
<script type="text/javascript">
   import MainLayout from '_layout/MainLayout.svelte';
   import Svelte2Wrapper from '_layout/partials/Svelte2Wrapper.svelte';

   let data = {
      settings: {
         webhook_url: 'test'
      }
   };
</script>

<MainLayout title="Hello world">
    <Svelte2Wrapper
        id="plugin-team-integrations"
        js="/lib/plugins/team-integrations/static/team-integrations.js"
        css="/lib/plugins/team-integrations/static/team-integrations.css"
        bind:data />
</MainLayout>
```

## Plugin server methods

Server methods are a way for plugins to hook new functionality into existing `frontend` components.

## General server methods

### `getDB`

Useful for getting the server database instance

```js
const db = server.methods.getDB();
await db.query('SELECT ...');
```

### `registerHeaderLinks`

Useful for adding links to our new navbar. Registered functions get called during request initialization, get the request object as parameter and should return an array of link objects, with the following attributes:

-   `id` - a unique id to reference this navbar item
-   `url` - the url to link to
-   `title` - the translated link text
-   `svgIcon` - the icon to use from `@datawrapper/icons`
-   `fontIcon` - alternatively links can also use a font icon (e.g. `"fa fa-user"`)
-   `order` - number to sort menu items by, useful for controlling the exact position of the navbar link
-   `parent` - if the navbar link should be located in a submenu you need to provide the id of the parent navbar item

Example:

```js
// river link
const { name, version } = require('./package.json');

module.exports = {
    name,
    version,
    register: (server, options) => {
        const { config } = options;
        // register river navbar link
        server.methods.registerHeaderLinks(request => {
            const __ = server.methods.getTranslate(request);
            return [
                {
                    id: 'river',
                    url: `//${config.domain}`,
                    parent: 'settings',
                    title: __('River', 'river'),
                    svgIcon: 'dw-river',
                    order: 22
                }
            ];
        });
    }
};
```

### `registerAdminPage`

To register admin pages, which as of now only adds a link to the admin submenu, but in the future will also power the admin settings sidebar.

```js
server.methods.registerAdminPage(request => {
    const __ = server.methods.getTranslate(request);
    return {
        url: '/admin/users',
        title: __('Users', 'admin-users'),
        group: __('Users'),
        svgIcon: 'user',
        order: 2
    };
});
```

Some admin pages may need more flexible routing to support sub-pages (e.g. `/admin/users/foo`).
This can now be achieved using the `pathRegex` property:

```js
server.methods.registerAdminPage(request => {
    const __ = server.methods.getTranslate(request);
    return {
        pathRegex: '/admin/teams/([a-zA-Z0-9-]+)',
        title: __('Users', 'admin-users'),
        group: __('Users'),
        svgIcon: 'user',
        order: 2
    };
});
```

Note that for admin pages without a `url` there won't be an automatic menu item. Instead, the menu will highlight the entry based on a common prefix (e.g. `/admin/teams`).

### `registerViewComponent`

View components can be used to dynamically load plugin-provided Svelte components into core routes. Imagine a situation where a core route (e.g. the publish step) wants to allow plugin to add new functionality (e.g. the PDF export). Since the Publish steps Svelte source "doesn't know" about the PDF export, we can't just import its Svelte source files.

```js
server.methods.registerViewComponent({
    // the id we want to idenntiy the component by
    id: 'publish/export-pdf',
    // the page in which the component should be imported
    page: 'edit/Index.svelte',
    // the components Svelte source
    view: '_plugins/export-pdf/ExportPDFUI.svelte'
});
```

The core route can then dynamically import the view component during runtime using the `ViewComponent` element:

```svelte
<ViewComponent id="publish/export-pdf" {props} {__} />
```

Internally, the view component import statements are [injected](src/utils/svelte-view/rollup-runtime.js#L97-L102) into the core `View.svelte` before it's being compiled, and then stored in the `viewComponents` context from which it's being [loaded by `ViewComponent.svelte`](src/views/_partials/ViewComponent.svelte#L13).

See [our dashboard](src/views/dashboard/Index.svelte) for a live example.

### `registerCustomData(key, handler)`

Plugins may "inject" custom data into routes that support this.

```js
server.methods.registerCustomData('hello/some-key', async ({ request }) => {
    // fetch some data and return it
    return {
        answer: 42
    };
})
```

In order for this to work, the route must call the `getCustomData` counter-part method to receive the data, and inject it in the correct place:

```js
// inside some core server route
return h.view('hello/Index.svelte', {
    props: {
        answer: 'unknown',
        ...(await server.methods.getCustomData('hello/some-key', { request }))
    }
});
```

Note that if multiple plugins register data for the same `key`, the results are "deep merged".

### `registerCustomHTML(key, handler)`

In rare occasions (like integrating existing Svelte2 components), plugins may need to inject custom HTML into a core server view. This can be done by calling `registerCustomHTML` in the plugin:

```js
server.methods.registerCustomHTML('hello/some-key', async (request) => {
    return '<script>alert("42 is the answer!")</script>';
})
```

In order for this to work, the route must call the `getCustomHTML` counter-part method to receive the HTML,  and pass it to the view as prop:

```js
// inside some core server route
return h.view('hello/Index.svelte', {
    props: {
        answer: 'unknown',
        customHTML: await server.methods.getCustomHTML('hello/some-key', { request })
    }
});
```

Of course, the view needs to inject the html string, too:

```svelte
<!-- inside the view -->
<script>
    export let customHTML = '';
</script>

{@html customHTML}
```

Please be aware that this opens a door for possible XSS attacks! **User-defined content must always be purified** before injecting it as custom html.

## View-specific server methods

### `registerDashboardSidebarBoxes` (dashboard)

Register one or many boxes to be shown in our dashboard sidebar

```js
// first you need to register the view component
server.methods.registerViewComponent({
    id: 'helloworld/name',
    page: 'dashboard/Index.svelte',
    view: '_plugins/hello-world/PrintName.svelte'
});

// then register the box controller
server.methods.registerDashboardSidebarBoxes(async request => {
    return [
        {
            order: 10,
            component: 'hello-world/name',
            props: {
                name: 'Alice'
            }
        },
        {
            order: 13,
            component: 'hello-world/name',
            props: {
                name: 'Bob'
            }
        }
    ];
});
```

### `addPublicTeamSettingsToArchive` (archive)

Plugins may expose additional team settings to the archive view:

```js
server.methods.addPublicTeamSettingsToArchive(({ settings }) => ({
    myCustomSetting: settings?.myCustomSetting || false
}));
```

### `registerArchiveVisualizationBoxSubline` (archive)

Plugins may render additional view components (see above) as part of archive VisualizationBox sublines.

```js
server.methods.registerArchiveVisualizationBoxSubline(async () => ({
    component: 'team-custom-fields/archive-subline-custom-field',
    order: 10,
    props: {
        someData: 42
    }
}));
```

### `registerArchiveVisualizationModalMetadata` (archive)

Plugins may also render additional view components (see above) as part of the metadata displayed in the archive's `VisualizationModal` component.

```js
server.methods.registerArchiveVisualizationModalMetadata(async () => ({
    component: 'team-custom-fields/archive-modal-custom-field',
    order: 10,
    props: {
        someData: 42
    }
}));
```

### `registerDemoDatasets` (chart editor)

Plugins may use this to register additional demo datasets.

```js
server.methods.registerDemoDatasets(({ request, chart }) => {
    return [{
        title: 'I am a demo dataset',
        type: { key: 'd3-lines / title', scope: 'd3-lines' },
        presets {
            type: 'd3-lines'
            "metadata.data.transpose": false
        },
        data: 'Label,Group,Value\nHello,World,1234'
    }];
});

```

### `registerChartAction` (chart editor)

Plugins may register additional chart actions to be shown in publish step

```js
server.methods.registerChartAction(async ({ request, chart, theme }) => {
    return {
        id: `export-zip`,
        title: 'ZIP',
        icon: 'file-archive-o',
        order: 400,
        mod: {
            id: 'svelte/export-zip',
            src: `/lib/plugins/export-zip/static/export-zip.js?v=${jsHash}`,
            css: `/lib/plugins/export-zip/static/export-zip.css?v=${cssHash}`,
            data: {
                answer: 42
            }
        }
    }
});

```

## Client-side event hooks

Sometimes a view component provided by a plugin needs to react to client-side events, e.g. to perform an action once the user publishes a chart. To achieve this, two things need to happen:

1. the view index to which the view component is registered to needs to dispatch the event:

```svelte
<-- in src/views/edit/Index.svelte -->
<script>
import { getContext } from 'svelte';
const contextEvents = getContext('events');

function onPublish(event) {
    contextEvents.dispatch('custom-event', event.detail);
}
</script>

<PublishStep on:publish={onPublish} />
```

The view component can then listen to these events, no matter where it's being loaded:

```jsx
// in plugins/foo/src/frontend/views/Custom.svelte
import { onMount, getContext } from 'svelte';
const contextEvents = getContext('events');

onMount(() => {
    contextEvents.on('custom-event', event => {
        console.log('custom event happened', event.detail);
    });
});
```
