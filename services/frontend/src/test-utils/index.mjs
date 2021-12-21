import { configure, render } from '@testing-library/svelte';
import Context from '../utils/svelte-view/Context.svelte';
import { getLocale } from './setup-locales.mjs';

export function setConfig(config) {
    configure(config);
}

export const defaultProps = {
    stores: {
        config: {
            apiDomain: 'api.datawrapper.local',
            frontendDomain: 'app.datawrapper.local',
            imageDomain: 'charts.datawrapper.local/preview',
            dev: 'true',
            footerLinks: [],
            languages: ['en-US'],
            headerLinks: [],
            stickyHeaderThreshold: 800
        },
        messages: getLocale(),
        user: {
            id: 2,
            name: 'user@datawrapper.de',
            email: 'user@datawrapper.de',
            language: 'en-US',
            isAdmin: false,
            isGuest: false,
            teams: [],
            activeTeam: null,
            isActivated: true
        },
        userData: {},
        request: {
            method: 'get',
            // url: [URL],
            path: '/archive',
            params: {},
            referrer: 'http://app.datawrapper.local/',
            query: {}
        }
    }
};

export async function renderWithContext(view, props) {
    // load locales again, in case the test loaded
    // additional plugin locales
    defaultProps.stores.messages = getLocale();
    return render(Context, {
        props: {
            ...defaultProps,
            view,
            ...props
        }
    });
}
