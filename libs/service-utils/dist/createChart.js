"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const boom_1 = __importDefault(require("@hapi/boom"));
const assign_deep_1 = __importDefault(require("assign-deep"));
const cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
const defaultChartMetadata_1 = __importDefault(require("./defaultChartMetadata"));
const findChartId_1 = __importDefault(require("./findChartId"));
const get_1 = __importDefault(require("lodash/get"));
const pick_1 = __importDefault(require("lodash/pick"));
const humps_1 = require("humps");
const ALLOWED_PAYLOAD_KEYS = [
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
module.exports = async function createChart({ server, user, payload = {}, session: sessionId, token }, newChartId = null) {
    const Chart = server.methods.getModel('chart');
    const Session = server.methods.getModel('session');
    const Theme = server.methods.getModel('theme');
    const Team = server.methods.getModel('team');
    const Folder = server.methods.getModel('folder');
    const __ = server.methods.translate;
    let session = null;
    if (sessionId) {
        session = await Session.findByPk(sessionId);
        if (!session)
            throw new Error('Unknown session id');
    }
    const language = user && user.role !== 'guest' ? user.language : (0, get_1.default)(session, 'data.dw-lang') || 'en-US';
    const defaults = (server.methods.config('general')['defaults'] || {
        type: 'bar-chart',
        theme: 'default'
    });
    let folderTeam = null;
    let payloadTeam = null;
    const allowedPayload = (0, pick_1.default)(payload, ALLOWED_PAYLOAD_KEYS);
    if ((session || token) && user.role !== 'guest') {
        if (payload.teamId && payload.teamId !== 'null') {
            // check that team exists and user is member
            payloadTeam = await Team.findByPk(payload.teamId);
            if (!payloadTeam)
                throw boom_1.default.forbidden('invalid team');
            if (!(await payloadTeam.hasUser(user)))
                throw boom_1.default.forbidden('invalid team');
            // team is ok, let's use it
            allowedPayload.organization_id = payloadTeam.id;
        }
        if (payload.folderId) {
            // check that folder exists
            const folder = await Folder.findByPk(payload.folderId);
            if (!folder)
                throw boom_1.default.forbidden('invalid folder');
            // check that user has access to the folder
            if (folder.user_id) {
                // user folder
                if (folder.user_id !== user.id)
                    throw boom_1.default.forbidden('invalid folder');
            }
            else {
                // team folder
                folderTeam = await folder.getTeam();
                // check that user has access to folder team
                if (!(await folderTeam.hasUser(user)))
                    throw boom_1.default.forbidden('invalid folder');
                // check that folder team matches teamId, if set
                if (payloadTeam && folderTeam.id !== payloadTeam.id)
                    throw boom_1.default.forbidden('invalid folder');
            }
            allowedPayload.in_folder = folder.id;
        }
    }
    if (allowedPayload.type) {
        // validate chart type
        if (!server.app.visualizations.has(allowedPayload.type)) {
            throw boom_1.default.badRequest('Invalid visualization type');
        }
    }
    const id = newChartId ?? (await (0, findChartId_1.default)(server));
    const chart = await Chart.create({
        title: `[ ${__('Insert title here', { scope: 'core', language })} ]`,
        theme: defaults.theme,
        type: defaults.type,
        language: user.language.replace('_', '-'),
        ...(0, humps_1.decamelizeKeys)(allowedPayload),
        metadata: (0, cloneDeep_1.default)(defaultChartMetadata_1.default),
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
    }
    else if (user.role !== 'guest' && (session || token)) {
        if (payload.folderId) {
            chartTeam = folderTeam;
        }
        else if (payload.teamId && payload.teamId !== 'null') {
            chartTeam = payloadTeam;
        }
        else if (payload.teamId === 'null') {
            chartTeam = null;
        }
        else {
            chartTeam = await user.getActiveTeam(session);
        }
        if (chartTeam) {
            chartTeam = await Team.findByPk(chartTeam.id);
            if (!chartTeam) {
                throw new Error('Unknown team');
            }
            chart.organization_id = chartTeam.id;
            if (!allowedPayload.in_folder && (0, get_1.default)(chartTeam.settings, 'default.folder')) {
                const folder = await Folder.findByPk((0, get_1.default)(chartTeam.settings, 'default.folder'));
                if (folder && folder.org_id === chartTeam.id) {
                    // move chart to team default folder
                    chart.in_folder = folder.id;
                }
            }
            if (!allowedPayload.language && (0, get_1.default)(chartTeam.settings, 'default.locale')) {
                // apply team default locale
                chart.language = (0, get_1.default)(chartTeam.settings, 'default.locale');
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
        chart.metadata = (0, assign_deep_1.default)(chart.metadata, themeData.metadata);
    }
    // apply team default metadata
    const teamDefaultMetadata = (0, get_1.default)(chartTeam, 'settings.default.metadata');
    if (teamDefaultMetadata) {
        chart.metadata = (0, assign_deep_1.default)(chart.metadata, teamDefaultMetadata);
    }
    // apply payload metadata
    const payloadMetadata = (0, get_1.default)(payload, 'metadata');
    if (payloadMetadata) {
        chart.metadata = (0, assign_deep_1.default)(chart.metadata, payloadMetadata);
    }
    if (payloadMetadata || themeData.metadata || teamDefaultMetadata) {
        chart.changed('metadata', true);
    }
    await chart.save();
    return chart;
};
