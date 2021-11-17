const findChartId = require('./findChartId');
const { decamelizeKeys } = require('humps');
const get = require('lodash/get');
const cloneDeep = require('lodash/cloneDeep');
const assignDeep = require('assign-deep');
const validateChartPayload = require('./validateChartPayload');

const defaultMetadata = {
    data: {},
    describe: {
        'source-name': '',
        'source-url': '',
        intro: '',
        byline: '',
        'aria-description': ''
    },
    visualize: {},
    publish: {}
};

/**
 * Create a new chart.
 *
 * @exports createChart
 * @kind function
 *
 * @param {object} options.payload                - properties of the new chart
 * @param {object} options.payload.title          - chart title
 * @param {object} options.payload.theme          - chart theme
 * @param {object} options.payload.type           - visualization type
 * @param {object} options.payload.language       - chart language
 * @param {object} options.payload.last_edit_step - chart last_edit_step
 * @param {object} options.payload.forkable       - should the chart be forkable?
 * @param {object} options.payload.forked_from    - chart id of source for forks
 * @param {object} options.payload.is_fork        - is the chart a fork?
 * @param {object} options.payload.external_data  - external data URL
 * @param {object} options.payload.folderId       - folder id
 * @param {object} options.payload.teamId         - team id
 * @param {object} options.server                 - instance of API or Frontend service
 * @param {object} options.session                - instance of current session
 * @param {object} options.token                  - instance of session token
 * @param {object} options.user                   - instance of authenticated user
 *
 * @returns {Chart} -- the new chart instance
 */
module.exports = async function createChart({ payload = {}, server, session, token, user }) {
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

    const id = await findChartId(server);

    const { validatedPayload, newChartTeam } = await validateChartPayload({
        server,
        payload,
        session,
        token,
        user
    });
    let chartTeam;

    const chart = await Chart.create({
        title: `[ ${__('Insert title here', { scope: 'core', language })} ]`,
        theme: defaults.theme,
        type: defaults.type,
        language: user.language.replace('_', '-'),
        ...decamelizeKeys(validatedPayload),
        metadata: cloneDeep(defaultMetadata),
        author_id: user.id,
        id
    });

    if (user.role === 'guest' && session) {
        chart.guest_session = session.id;
    } else if (user.role !== 'guest' && (session || token)) {
        chartTeam = newChartTeam || (await user.getActiveTeam(session));
        if (chartTeam) {
            chartTeam = await Team.findByPk(chartTeam.id);
            chart.organization_id = chartTeam.id;
            if (!validatedPayload.in_folder && get(chartTeam.settings, 'default.folder')) {
                const folder = await Folder.findByPk(get(chartTeam.settings, 'default.folder'));

                if (folder && folder.org_id === chartTeam.id) {
                    // move chart to team default folder
                    chart.in_folder = folder.id;
                }
            }

            if (!validatedPayload.language && get(chartTeam.settings, 'default.locale')) {
                // apply team default locale
                chart.language = get(chartTeam.settings, 'default.locale');
            }

            if (!validatedPayload.theme && chartTeam.default_theme) {
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
