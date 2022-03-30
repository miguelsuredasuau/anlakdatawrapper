const findChartId = require('./findChartId');
const { decamelizeKeys } = require('humps');
const get = require('lodash/get');
const cloneDeep = require('lodash/cloneDeep');
const assignDeep = require('assign-deep');
const Boom = require('@hapi/boom');
const defaultMetadata = require('./defaultChartMetadata');

const PAYLOAD_KEYS = new Set([
    'title',
    'theme',
    'type',
    'language',
    'last_edit_step',
    'forkable',
    'forked_from',
    'is_fork',
    'external_data'
]);

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
 *
 * @returns {Chart} -- instance of new chart object
 */
module.exports = async ({ server, user, payload = {}, session, token }) => {
    const Chart = server.methods.getModel('chart');
    const Session = server.methods.getModel('session');
    const Theme = server.methods.getModel('theme');
    const Team = server.methods.getModel('team');
    const Folder = server.methods.getModel('folder');
    const __ = server.methods.translate;

    if (session) {
        session = await Session.findByPk(session);
        if (!session) throw new Error('Unknown session id');
    }

    const language =
        user && user.role !== 'guest' ? user.language : get(session, 'data.dw-lang') || 'en-US';

    const defaults = server.methods.config('general').defaults || {
        type: 'bar-chart',
        theme: 'default'
    };

    let folderTeam = null;
    let payloadTeam = null;

    const whitelistedPayload = {};
    PAYLOAD_KEYS.forEach(key => {
        if (payload[key]) whitelistedPayload[key] = payload[key];
    });

    if ((session || token) && user.role !== 'guest') {
        if (payload.teamId && payload.teamId !== 'null') {
            // check that team exists and user is member
            payloadTeam = await Team.findByPk(payload.teamId);
            if (!payloadTeam) throw Boom.forbidden('invalid team');
            if (!(await payloadTeam.hasUser(user))) throw Boom.forbidden('invalid team');
            // team is ok, let's use it
            whitelistedPayload.organization_id = payloadTeam.id;
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
            whitelistedPayload.in_folder = folder.id;
        }
    }

    if (whitelistedPayload.type) {
        // validate chart type
        if (!server.app.visualizations.has(whitelistedPayload.type)) {
            throw Boom.badRequest('Invalid visualization type');
        }
    }

    const id = await findChartId(server);

    const chart = await Chart.create({
        title: `[ ${__('Insert title here', { scope: 'core', language })} ]`,
        theme: defaults.theme,
        type: defaults.type,
        language: user.language.replace('_', '-'),
        ...decamelizeKeys(whitelistedPayload),
        metadata: cloneDeep(defaultMetadata),
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
            chart.organization_id = chartTeam.id;
            if (!whitelistedPayload.in_folder && get(chartTeam.settings, 'default.folder')) {
                const folder = await Folder.findByPk(get(chartTeam.settings, 'default.folder'));

                if (folder && folder.org_id === chartTeam.id) {
                    // move chart to team default folder
                    chart.in_folder = folder.id;
                }
            }

            if (!whitelistedPayload.language && get(chartTeam.settings, 'default.locale')) {
                // apply team default locale
                chart.language = get(chartTeam.settings, 'default.locale');
            }

            if (!whitelistedPayload.theme && chartTeam.default_theme) {
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
};
