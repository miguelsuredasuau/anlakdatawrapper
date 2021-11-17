const Boom = require('@hapi/boom');
const get = require('lodash/get');
const set = require('lodash/set');

const ALLOWED_KEYS = new Set([
    'author_id',
    'external_data',
    'forkable',
    'forked_from',
    'is_fork',
    'language',
    'last_edit_step',
    'metadata',
    'public_url',
    'public_version',
    'published_at',
    'theme',
    'title',
    'type'
]);

const CREATE_ONLY_KEYS = new Set(['forked_from', 'is_fork']);

const ADMIN_ONLY_KEYS = new Set(['author_id']);

module.exports = async function validateChartPayload({
    chart,
    payload,
    server,
    session,
    token,
    user
}) {
    const Folder = server.methods.getModel('folder');
    const Team = server.methods.getModel('team');
    const isCreate = !chart;
    const isAdmin = user.isAdmin();

    // Allow setting only specific chart properties.
    const validatedPayload = Object.fromEntries(
        Object.entries(payload).filter(([key]) => {
            if (!ALLOWED_KEYS.has(key)) {
                return false;
            }
            if (!isAdmin) {
                if (ADMIN_ONLY_KEYS.has(key)) {
                    return false;
                }
                if (!isCreate && CREATE_ONLY_KEYS.has(key)) {
                    // Notice that admin can update properties that are otherwise create-only.
                    return false;
                }
            }
            return true;
        })
    );

    // Validate chart type.
    if (validatedPayload.type && !server.app.visualizations.has(validatedPayload.type)) {
        throw Boom.badRequest('Invalid visualization type');
    }

    let newChartTeam;

    if ((session || token) && user.role !== 'guest') {
        // Check that the team exists and the user is its member or is an admin.
        const teamId = payload.team_id || payload.organization_id; // Alias
        let team;
        if (teamId) {
            team = await Team.findByPk(teamId);
            if (!team) throw Boom.forbidden('invalid team');
            if (!isAdmin && !(await user.hasActivatedTeam(teamId)))
                throw Boom.forbidden('invalid team');

            validatedPayload.organization_id = team.id;
            newChartTeam = team;
        } else if (teamId === null) {
            // Allow setting team to null.
            validatedPayload.organization_id = null;
        }

        // Check that the folder exists and the user has access to it.
        const folderId = payload.folder_id;
        if (folderId) {
            const folder = await Folder.findByPk(folderId);
            if (!folder) throw Boom.forbidden('invalid folder');
            if (folder.user_id) {
                // Check user folder.
                if (!isAdmin && folder.user_id !== user.id) throw Boom.forbidden('invalid folder');
            } else {
                // Check team folder.
                const folderTeam = await folder.getTeam();
                if (!folderTeam) throw Boom.forbidden('invalid folder');
                if (!isAdmin && !(await user.hasActivatedTeam(folderTeam.id)))
                    throw Boom.forbidden('invalid team');

                // Check that folder team matches teamId, when both teamId and folderId are set.
                if (team && folderTeam.id !== team.id) throw Boom.forbidden('invalid folder');

                // Overwrite chart team id with the folder team id.
                validatedPayload.organization_id = folderTeam.id;

                newChartTeam = folderTeam;
            }
            validatedPayload.in_folder = folder.id;
        } else if (folderId === null) {
            // Allow setting folder to null.
            validatedPayload.in_folder = null;
        }

        // Move chart to the root folder of a team, when teamId is set but folderId is not.
        if (teamId && !folderId) {
            validatedPayload.in_folder = null;
        }
    }

    // Prevent information about earlier publish from being reverted.
    if (
        !isCreate &&
        !isNaN(validatedPayload.public_version) &&
        validatedPayload.public_version < chart.public_version
    ) {
        validatedPayload.public_version = chart.public_version;
        validatedPayload.public_url = chart.public_url;
        validatedPayload.published_at = chart.published_at;
        validatedPayload.last_edit_step = chart.last_edit_step;
        set(
            validatedPayload,
            'metadata.publish.embed-codes',
            get(chart, 'metadata.publish.embed-codes', {})
        );
    }

    return {
        validatedPayload,
        newChartTeam
    };
};
