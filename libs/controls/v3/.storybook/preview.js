import localeEN from '../stories/static/locale.en.json';

global.dw = {
    backend: {
        __messages: {
            core: localeEN
        }
    }
};

import Wrapper from './Wrapper.svelte';

export const decorators = [
    storyFn => {
        const story = storyFn();

        return {
            Component: Wrapper,
            props: {
                child: story.Component,
                props: story.props
            }
        };
    }
];

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
    layout: 'fullscreen',
    options: { showPanel: false }
};
