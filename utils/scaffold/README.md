# scaffold

Quick-start tempates for various Datawrapper related code setups.

* `scaffold` will never overwrite existing files
* `scaffold` might alter existing `package.json` files but again, it will only add non-existing scripts



## Usage:

List all templates:

```bash
> npx github:datawrapper/scaffold

Usage: scaffold [template]

Available templates are: 
 - ava-esm
 - plugin
 - plugin-api
 - plugin-frontend
 - sort-pkg-json
 - svelte2
 - update-dw-deps
```

Find out more about a certain template:

```sh
> npx github:datawrapper/scaffold sort-pkg-json --help
scaffold sort-pkg-json

Brings package.json properties into a consistent order and fills in
Datawrapper GmbH as author if missing.
```

Execute a template:

```
> cd core/plugins/my-plugin
> npx github:datawrapper/scaffold sort-pkg-json
```

## Development

You can add new templates by adding a new folder inside [templates](templates/). At the bare minimum your template needs

- a `readme` file that explains what the template is useful for
- a [`files`](templates/plugin/files) folder which contains files you want to copy or an [`index.js`](templates/sort-pkg-json/index.js) script to mingle with `package.json` files etc.


