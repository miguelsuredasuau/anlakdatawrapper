const path = require('path');
const { ForeignKeyConstraintError } = require('sequelize');
const { addScope } = require('@datawrapper/service-utils/l10n');
const { init } = require('../../src/server');
const { nanoid, customAlphabet } = require('nanoid');
const { randomInt } = require('crypto');

/* bcrypt hash for string "test-password" */
const PASSWORD_HASH = '$2a$05$6B584QgS5SOXi1m.jM/H9eV.2tCaqNc5atHnWfYlFe5riXVW9z7ja';

const BASE_URL = 'http://api.datawrapper.local';
// const BASE_URL = 'http://app.datawrapper.local/api';

const ALL_SCOPES = [
    'user:read',
    'user:write',
    'auth:read',
    'auth:write',
    'chart:read',
    'chart:write',
    'team:read',
    'team:write',
    'folder:read',
    'folder:write',
    'plugin:read',
    'plugin:write',
    'theme:read',
    'product:read',
    'visualization:read'
];

function getCredentials() {
    return {
        email: `test-${nanoid(5)}@ava.de`,
        password: 'test-password'
    };
}

async function setup(options) {
    const server = await init(options);

    // Register fake d3-bars type.
    server.methods.registerVisualization('d3-bars', [
        {
            id: 'd3-bars',
            dependencies: {},
            less: path.join(__dirname, '../data/chart.less'),
            script: path.join(__dirname, '../data/chart.js')
        }
    ]);

    // Add fake 'chart' scope.
    addScope('chart', {
        'en-US': {}
    });

    // Create default theme if it doesn't exist.
    const { Theme } = require('@datawrapper/orm/models');
    await Theme.findOrCreate({
        where: { id: 'default' },
        defaults: {
            data: {},
            assets: {}
        }
    });

    return server;
}

async function createUser(
    server,
    { role = 'editor', pwd = PASSWORD_HASH, scopes = ALL_SCOPES } = {}
) {
    const { AccessToken, Session, User } = require('@datawrapper/orm/models');
    const credentials = getCredentials();
    const user = await User.create({
        name: `name-${credentials.email.split('@').shift()}`,
        email: credentials.email,
        pwd,
        role
    });

    const session = await Session.create({
        id: server.methods.generateToken(),
        user_id: user.id,
        data: {
            'dw-user-id': user.id,
            persistent: true,
            last_action_time: Math.floor(Date.now() / 1000)
        }
    });

    const { token } = await AccessToken.newToken({
        user_id: user.id,
        type: 'api-token',
        data: {
            comment: 'API TEST',
            scopes
        }
    });

    session.scope = scopes;

    return {
        user,
        session,
        token
    };
}

async function createTeam(props = {}) {
    const { Team } = require('@datawrapper/orm/models');

    return await Team.create({
        id: `test-${nanoid(5)}`,
        name: 'Test Team',
        settings: {
            default: {
                locale: 'en-US'
            },
            flags: {
                embed: true,
                byline: true,
                pdf: false
            },
            css: 'body {background:red;}',
            embed: {
                custom_embed: {
                    text: '',
                    title: 'Chart ID',
                    template: '%chart_id%'
                },
                preferred_embed: 'responsive'
            }
        },
        ...props
    });
}

async function createTeamWithUser(server, { role = 'owner' } = {}) {
    const { UserTeam } = require('@datawrapper/orm/models');
    const teamPromise = createTeam();

    const [team, userObj] = await Promise.all([teamPromise, createUser(server)]);
    const { user, session, token } = userObj;

    await UserTeam.create({
        user_id: user.id,
        organization_id: team.id,
        team_role: role
    });

    async function addUser(role = 'owner') {
        const userObj = await createUser(server);
        const { user } = userObj;
        await UserTeam.create({
            user_id: user.id,
            organization_id: team.id,
            team_role: role
        });
        return userObj;
    }

    session.scope = ALL_SCOPES;

    return { team, user, session, token, addUser };
}

const genRandomChartId = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    5
);

const MAX_FOLDER_ID = 99999;

function genRandomFolderId() {
    return String(randomInt(MAX_FOLDER_ID));
}

function genNonExistentFolderId() {
    return String(MAX_FOLDER_ID + 1);
}

function createFolder(props = {}) {
    const { Folder } = require('@datawrapper/orm/models');
    return Folder.create({
        ...props,
        name: props.name || genRandomFolderId()
    });
}

function createFolders(propsArray) {
    return Promise.all(propsArray.map(createFolder));
}

function createFoldersWithParent(propsArray, parent) {
    return createFolders(propsArray.map(props => ({ ...props, parent_id: parent.id })));
}

function createChart(props = {}) {
    const { Chart } = require('@datawrapper/orm/models');
    return Chart.create({
        metadata: {
            axes: [],
            describe: {},
            visualize: {},
            annotate: {}
        },
        language: 'en-US',
        title: 'Default',
        theme: 'default',
        type: 'd3-bars',
        ...props,
        id: props.id || genRandomChartId()
    });
}

function createCharts(propsArray) {
    return Promise.all(propsArray.map(createChart));
}

async function addUserToTeam(user, team, role = 'member') {
    const { UserTeam } = require('@datawrapper/orm/models');

    await UserTeam.create({
        user_id: user.id,
        organization_id: team.id,
        team_role: role
    });
}

async function destroyChart(chart) {
    const { Chart, ChartPublic } = require('@datawrapper/orm/models');
    await ChartPublic.destroy({ where: { id: chart.id }, force: true });
    await Chart.destroy({ where: { forked_from: chart.id }, force: true });
    await chart.destroy({ force: true });
}

async function destroyTeam(team) {
    const { Chart, TeamProduct, UserTeam, Folder } = require('@datawrapper/orm/models');
    const charts = await Chart.findAll({ where: { organization_id: team.id } });
    for (const chart of charts) {
        await destroyChart(chart);
    }
    await Folder.destroy({ where: { org_id: team.id } });
    await TeamProduct.destroy({ where: { organization_id: team.id }, force: true });
    await UserTeam.destroy({ where: { organization_id: team.id }, force: true });
    await team.destroy({ force: true });
}

async function destroyUser(user) {
    const {
        AccessToken,
        Action,
        Chart,
        Folder,
        Session,
        UserData,
        UserPluginCache,
        UserProduct,
        UserTeam
    } = require('@datawrapper/orm/models');
    await AccessToken.destroy({ where: { user_id: user.id }, force: true });
    await Action.destroy({ where: { user_id: user.id }, force: true });
    await Session.destroy({ where: { user_id: user.id }, force: true });
    const charts = await Chart.findAll({ where: { author_id: user.id } });
    for (const chart of charts) {
        await destroyChart(chart);
    }
    await Folder.destroy({ where: { user_id: user.id } });
    await UserData.destroy({ where: { user_id: user.id }, force: true });
    await UserPluginCache.destroy({ where: { user_id: user.id }, force: true });
    await UserProduct.destroy({ where: { user_id: user.id }, force: true });
    await UserTeam.destroy({ where: { user_id: user.id }, force: true });
    try {
        await user.destroy({ force: true });
    } catch (e) {
        if (e instanceof ForeignKeyConstraintError) {
            // TODO Don't just log and ignore this error, but rather figure out how to delete the
            // associated model instances correctly.
            console.error(e);
        }
    }
}

async function destroy(...instances) {
    const { Chart, Team, User } = require('@datawrapper/orm/models');
    for (const instance of instances) {
        if (!instance) {
            continue;
        }
        if (Array.isArray(instance)) {
            await destroy(...instance);
        } else if (instance instanceof Chart) {
            await destroyChart(instance);
        } else if (instance instanceof Team) {
            await destroyTeam(instance);
        } else if (instance instanceof User) {
            await destroyUser(instance);
        } else if (instance.destroy) {
            await instance.destroy({ force: true });
        }
    }
}

module.exports = {
    BASE_URL,
    createChart,
    createCharts,
    createFolder,
    createFolders,
    createFoldersWithParent,
    createTeam,
    createTeamWithUser,
    createUser,
    destroy,
    genNonExistentFolderId,
    genRandomChartId,
    genRandomFolderId,
    getCredentials,
    setup,
    addUserToTeam
};
