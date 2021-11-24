import { render } from '@testing-library/svelte';
import Context from '../utils/svelte-view/Context.svelte';
import { getLocale } from './setup-locales.mjs';

export async function renderWithContext(view, props) {
    return render(Context, {
        props: {
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
                request: {
                    method: 'get',
                    // url: [URL],
                    path: '/archive',
                    params: {},
                    referrer: 'http://app.datawrapper.local/',
                    query: {}
                }
            },
            apiQuery: {
                groupBy: null,
                limit: 96,
                offset: 0,
                search: '',
                order: 'DESC',
                minLastEditStep: 2,
                orderBy: 'lastModifiedAt'
            },
            charts: { list: [], total: 0 },
            teamId: undefined,
            folderId: undefined,
            folders: {
                $user: {
                    id: null,
                    key: '$user',
                    teamId: null,
                    parentId: null,
                    name: 'My archive',
                    chartCount: 0
                }
            },
            teams: [],
            minLastEditStep: 2,
            themeBgColors: {},
            view,
            ...props
        }
    });
}
