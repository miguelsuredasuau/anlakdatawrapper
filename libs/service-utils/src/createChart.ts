import type { AccessTokenModel, ChartModel, SessionModel, UserModel } from '@datawrapper/orm';
import Boom from '@hapi/boom';
import assignDeep from 'assign-deep';
import cloneDeep from 'lodash/cloneDeep';
import { defaultChartMetadata } from './defaultChartMetadata';
import { findChartId } from './findChartId';
import get from 'lodash/get';
import pick from 'lodash/pick';
import { decamelizeKeys } from 'humps';
import type { ChartDataValues } from './chartModelTypes';
import type { Server } from './serverTypes';

type AllowedPayload = {
    title?: string;
    theme?: string;
    type?: string;
    language?: string;
    last_edit_step?: number;
    forkable?: boolean;
    forked_from?: string;
    is_fork?: boolean;
    external_data?: string;
};

type Payload = AllowedPayload & {
    teamId?: string;
    folderId?: string;
};

const ALLOWED_PAYLOAD_KEYS: (keyof AllowedPayload)[] = [
    'title',
    'theme',
    'type',
    'language',
    'last_edit_step',
    'forkable',
    'forked_from',
    'is_fork',
    'external_data'
];

/**
 * Creates a new visualization
 * @exports createChart
 * @kind function
 *
 * @param {object} options.server     - instance of API or Frontend service
 * @param {object} options.user       - instance of authenticated user
 * @param {object} options.session    - instance of current session
 * @param {object} options.payload    - presets for the new visualization
 * @param {object} options.payload.title    - visualization title
 * @param {object} options.payload.theme   - visualization theme
 * @param {object} options.payload.type     - visualization type
 * @param {object} options.payload.language         - visualization language
 * @param {object} options.payload.last_edit_step   - visualization last_edit_step
 * @param {object} options.payload.forkable          - should vis be forkable
 * @param {object} options.payload.forked_from      - chart id of source for forks
 * @param {object} options.payload.is_fork           - chart id of source for forks
 * @param {object} options.payload.external_data    - chart id of source for forks
 * @param {object} options.payload.folderId          - folder id, will be checked and used to determine team
 * @param {object} options.payload.teamId            - team id will be used to determine defaults
 * @param {string} [newChartId]         - when supplied, new chart is created with this ID instead of auto-generated one
 *
 * @returns {Chart} -- instance of new chart object
 */
export async function createChart(
    {
        server,
        user,
        payload = {},
        session: sessionId,
        token
    }: {
        server: Server;
        user: UserModel;
        payload: Payload;
        session: string;
        token: AccessTokenModel;
    },
    newChartId: string | null = null
): Promise<ChartModel> {
    const Chart = server.methods.getModel('chart');
    const Session = server.methods.getModel('session');
    const Theme = server.methods.getModel('theme');
    const Team = server.methods.getModel('team');
    const Folder = server.methods.getModel('folder');
    const __ = server.methods.translate;

    let session: SessionModel | null = null;
    if (sessionId) {
        session = await Session.findByPk(sessionId);
        if (!session) throw new Error('Unknown session id');
    }

    const language =
        user && user.role !== 'guest' ? user.language : get(session, 'data.dw-lang') || 'en-US';

    const defaults = (server.methods.config('general')?.['defaults'] || {
        type: 'bar-chart',
        theme: 'default'
    }) as ChartDataValues;

    let folderTeam = null;
    let payloadTeam = null;

    const allowedPayload: Partial<ChartDataValues> & AllowedPayload = pick(
        payload,
        ALLOWED_PAYLOAD_KEYS
    );

    if ((session || token) && user.role !== 'guest') {
        if (payload.teamId && payload.teamId !== 'null') {
            // check that team exists and user is member
            payloadTeam = await Team.findByPk(payload.teamId);
            if (!payloadTeam) throw Boom.forbidden('invalid team');
            if (!(await payloadTeam.hasUser(user))) throw Boom.forbidden('invalid team');
            // team is ok, let's use it
            allowedPayload.organization_id = payloadTeam.id;
        }

        if (payload.folderId) {
            // check that folder exists
            const folder = await Folder.findByPk(payload.folderId);
            if (!folder) throw Boom.forbidden('invalid folder');
            // check that user has access to the folder
            if (folder.user_id) {
                // user folder
                if (folder.user_id !== user.id) throw Boom.forbidden('invalid folder');
            } else {
                // team folder
                folderTeam = await folder.getTeam();
                // check that user has access to folder team
                if (!(await folderTeam.hasUser(user))) throw Boom.forbidden('invalid folder');

                // check that folder team matches teamId, if set
                if (payloadTeam && folderTeam.id !== payloadTeam.id)
                    throw Boom.forbidden('invalid folder');
            }
            allowedPayload.in_folder = folder.id;
        }
    }

    if (allowedPayload.type) {
        // validate chart type
        if (!server.app.visualizations.has(allowedPayload.type)) {
            throw Boom.badRequest('Invalid visualization type');
        }
    }

    const id = newChartId ?? (await findChartId(server));

    const chart = await Chart.create({
        title: `[ ${__('Insert title here', { scope: 'core', language })} ]`,
        theme: defaults.theme,
        type: defaults.type,
        language: user.language.replace('_', '-'),
        ...(decamelizeKeys(allowedPayload) as typeof allowedPayload),
        metadata: cloneDeep(defaultChartMetadata),
        author_id: user.id,
        id
    });

    /*
        if folderId is defined: use team from the folder
        if teamId is defined but not "null": use that team
        -> if teamId is "null": don't set a team
        if teamId is undefined: use active team
    */

    let chartTeam;

    if (user.role === 'guest' && session) {
        chart.guest_session = session.id;
    } else if (user.role !== 'guest' && (session || token)) {
        if (payload.folderId) {
            chartTeam = folderTeam;
        } else if (payload.teamId && payload.teamId !== 'null') {
            chartTeam = payloadTeam;
        } else if (payload.teamId === 'null') {
            chartTeam = null;
        } else {
            chartTeam = await user.getActiveTeam(session);
        }

        if (chartTeam) {
            chartTeam = await Team.findByPk(chartTeam.id);
            if (!chartTeam) {
                throw new Error('Unknown team');
            }
            chart.organization_id = chartTeam.id;
            if (!allowedPayload.in_folder && get(chartTeam.settings, 'default.folder')) {
                const folder = await Folder.findByPk(
                    get(chartTeam.settings, 'default.folder') as string
                );

                if (folder && folder.org_id === chartTeam.id) {
                    // move chart to team default folder
                    chart.in_folder = folder.id;
                }
            }

            if (!allowedPayload.language && get(chartTeam.settings, 'default.locale')) {
                // apply team default locale
                chart.language = get(chartTeam.settings, 'default.locale') as string;
            }

            if (!allowedPayload.theme && chartTeam.default_theme) {
                // apply team default theme
                chart.theme = chartTeam.default_theme;
            }
        }
    }

    let theme;
    for (const themeId of [chart.theme, defaults.theme, 'default']) {
        theme = await Theme.findByPk(themeId);
        if (theme) {
            chart.theme = themeId;
            break;
        }
    }
    if (!theme) {
        throw new Error('No theme found');
    }

    // apply theme default metadata
    const themeData = await theme.getMergedData();
    if (themeData.metadata) {
        chart.metadata = assignDeep(chart.metadata, themeData.metadata);
    }

    // apply team default metadata
    const teamDefaultMetadata = get(chartTeam, 'settings.default.metadata');
    if (teamDefaultMetadata) {
        chart.metadata = assignDeep(chart.metadata, teamDefaultMetadata);
    }

    // apply payload metadata
    const payloadMetadata = get(payload, 'metadata');
    if (payloadMetadata) {
        chart.metadata = assignDeep(chart.metadata, payloadMetadata);
    }

    if (payloadMetadata || themeData.metadata || teamDefaultMetadata) {
        chart.changed('metadata', true);
    }

    await chart.save();
    return chart;
}
