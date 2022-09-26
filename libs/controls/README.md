# controls

![lint-and-test](https://github.com/datawrapper/controls/workflows/lint-and-test/badge.svg)

A collection of Svelte controls used across Datawrapper.

## version 2.x: Svelte 2 controls

The Svelte 2 controls we're currently using in the visualization editor. Live preview and documentation:

https://docs.datawrapper.de/~repos/controls/main/v2/

To install and use the controls, run

```sh
npm i @datawrapper/controls@2
```

Then you can import individual controls via

```js
import CheckboxControl from '@datawrapper/controls/CheckboxControl.html';
```

If you want to develop the controls you should run `storybook` locally.

```bash
cd v2 && npm install && npm run storybook
```

### Testing component with local Datawrapper app during development

Execute the following steps to test changes of components in local Datawrapper app instance.

```bash
cd libs/controls/v2
npm link
cd ../../services/datawrapper/src
npm link @datawrapper/controls
npm run dev
```

## version 3.x: Svelte 3 controls

Live preview and documentation:

https://docs.datawrapper.de/~repos/controls/main/v3/

To install and use the controls, run

```sh
npm i @datawrapper/controls
```

Import and develop controls locally the same way as in v2.
