const path = require('path');
const { ForeignKeyConstraintError } = require('sequelize');
const { create } = require('../../src/server');
const { generateToken } = require('../../src/utils');
const { nanoid, customAlphabet } = require('nanoid');
const { randomInt } = require('crypto');

/* bcrypt hash for string "test-password" */
const PASSWORD_HASH = '$2a$05$6B584QgS5SOXi1m.jM/H9eV.2tCaqNc5atHnWfYlFe5riXVW9z7ja';

const BASE_URL = 'http://api.datawrapper.local';
const V1_BASE_URL = '/v3/api-v1';

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
    'product:write',
    'visualization:read'
];

function getCredentials() {
    return {
        email: `test-${nanoid(5)}@ava.de`,
        password: 'test-password'
    };
}

async function setup(options) {
    const server = await create(options);
    await server.initialize();

    // Register fake d3-bars type.
    server.methods.registerVisualization('d3-bars', [
        {
            id: 'd3-bars',
            dependencies: {},
            less: path.join(__dirname, '../data/chart.less'),
            script: path.join(__dirname, '../data/chart.js')
        }
    ]);

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

async function createGuestSession(server) {
    const res = await server.inject({
        method: 'POST',
        url: '/v3/auth/session'
    });
    if (res.statusCode !== 200) {
        throw new Error('Failed to create guest session');
    }
    return res.result['DW-SESSION'];
}

async function createUser(
    server,
    { role = 'editor', pwd = PASSWORD_HASH, scopes = ALL_SCOPES, language = 'en-US' } = {}
) {
    const { AccessToken, User } = require('@datawrapper/orm/models');
    const credentials = getCredentials();
    const user = await User.create({
        name: `name-${credentials.email.split('@').shift()}`,
        email: credentials.email,
        pwd,
        role,
        language
    });

    const session = await createSession(server, user);

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

async function withUser(server, options, func) {
    const userObj = await createUser(server, options);
    try {
        return await func(userObj);
    } finally {
        await destroy(...Object.values(userObj));
    }
}

async function createSession(server, user) {
    const { Session } = require('@datawrapper/orm/models');

    return await Session.create({
        id: generateToken(),
        user_id: user.id,
        data: {
            'dw-user-id': user.id,
            persistent: true,
            last_action_time: Math.floor(Date.now() / 1000)
        }
    });
}

async function setUserData(user, key, value) {
    const { setUserData } = require('@datawrapper/orm/utils/userData.js');
    await setUserData(user.id, key, value);
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
                get_the_data: true,
                layout_selector: true,
                output_locale: true,
                embed: true,
                byline: true,
                pdf: false
            },
            privateBasemaps: {
                eu: false
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

async function withTeam(props, func) {
    const team = await createTeam(props);
    try {
        return await func(team);
    } finally {
        await destroy(team);
    }
}

async function createTeamWithUser(server, { role = 'owner', invite_token = '' } = {}) {
    const { UserTeam } = require('@datawrapper/orm/models');
    const teamPromise = createTeam();

    const [team, userObj] = await Promise.all([teamPromise, createUser(server)]);
    const { user, session, token } = userObj;

    await UserTeam.create({
        user_id: user.id,
        organization_id: team.id,
        team_role: role,
        invite_token
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

    async function withTeamUser(role, userFunc) {
        const userObj = await addUser(role);
        try {
            await userFunc(userObj);
        } finally {
            await destroy(...Object.values(userObj));
        }
    }

    session.scope = ALL_SCOPES;

    return { team, user, session, token, addUser, withTeamUser };
}

async function withTeamWithUser(server, options, func) {
    const teamObj = await createTeamWithUser(server, options);
    try {
        return await func(teamObj);
    } finally {
        await destroy(...Object.values(teamObj));
    }
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
    let metadata = {
        axes: [],
        describe: {},
        visualize: {},
        annotate: {}
    };
    if (props.metadata) {
        metadata = { ...metadata, ...props.metadata };
    }
    return Chart.create({
        metadata,
        language: 'en-US',
        title: 'Default',
        theme: 'default',
        type: 'd3-bars',
        ...props,
        id: props.id || genRandomChartId()
    });
}

async function createPublicChart(props = {}) {
    const chart = await createChart({
        last_edit_step: 5,
        public_verison: 1,
        published_at: new Date(),
        ...props
    });
    const { ChartPublic } = require('@datawrapper/orm/models');
    let metadata = {
        axes: [],
        describe: {},
        visualize: {},
        annotate: {}
    };
    if (props.metadata) {
        metadata = { ...metadata, ...props.metadata };
    }
    return ChartPublic.create({
        metadata,
        language: 'en-US',
        title: 'Default',
        theme: 'default',
        type: 'd3-bars',
        ...(props.published_at && { first_published_at: props.published_at }),
        ...props,
        id: chart.id
    });
}

async function getPublicChart(id) {
    const { ChartPublic, Chart } = require('@datawrapper/orm/models');
    return ChartPublic.findByPk(id, {
        include: [Chart]
    });
}

function createCharts(propsArray) {
    return Promise.all(propsArray.map(createChart));
}

function getChart(id) {
    const { Chart } = require('@datawrapper/orm/models');
    return Chart.findByPk(id);
}

function getTheme(id) {
    const { Theme } = require('@datawrapper/orm/models');
    return Theme.findByPk(id);
}

function createTheme(props = {}) {
    const { Theme } = require('@datawrapper/orm/models');
    return Theme.create({
        data: {},
        assets: {},
        title: 'Theme Title',
        ...props,
        id: props.id || nanoid(5)
    });
}

function createThemes(propsArray) {
    return Promise.all(propsArray.map(createTheme));
}

async function addUserToTeam(user, team, role = 'member') {
    const { UserTeam } = require('@datawrapper/orm/models');

    await UserTeam.create({
        user_id: user.id,
        organization_id: team.id,
        team_role: role
    });
}

async function addThemeToTeam(theme, team) {
    const { TeamTheme } = require('@datawrapper/orm/models');

    await TeamTheme.create({
        organization_id: team.id,
        theme_id: theme.id
    });
}

function getProduct(id) {
    const { Product } = require('@datawrapper/orm/models');
    return Product.findByPk(id);
}

async function createProduct(props = {}) {
    const { Product } = require('@datawrapper/orm/models');
    return Product.create({
        ...props,
        data: props.data && JSON.stringify(props.data),
        name: props.name || nanoid(5)
    });
}

function createPlugin(props = {}) {
    const { Plugin } = require('@datawrapper/orm/models');
    return Plugin.create(props);
}

function getProductPlugin(productId, pluginId) {
    const { ProductPlugin } = require('@datawrapper/orm/models');
    return ProductPlugin.findOne({ where: { productId, pluginId } });
}

async function addPluginToProduct(plugin, product) {
    const { ProductPlugin } = require('@datawrapper/orm/models');
    return ProductPlugin.create({
        pluginId: plugin.id,
        productId: product.id
    });
}

async function addProductToTeam(product, team) {
    const { TeamProduct } = require('@datawrapper/orm/models');
    return TeamProduct.create({
        organization_id: team.id,
        productId: product.id
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

async function destroyTheme(theme) {
    const { TeamTheme } = require('@datawrapper/orm/models');
    await TeamTheme.destroy({ where: { theme_id: theme.id } });
    await theme.destroy({ force: true });
}

async function destroy(...instances) {
    const { Chart, Team, User, Theme, ChartPublic } = require('@datawrapper/orm/models');
    for (const instance of instances) {
        if (!instance) {
            continue;
        }
        if (Array.isArray(instance)) {
            await destroy(...instance);
        } else if (instance instanceof ChartPublic) {
            await destroyChart(instance);
        } else if (instance instanceof Chart) {
            await destroyChart(instance);
        } else if (instance instanceof Team) {
            await destroyTeam(instance);
        } else if (instance instanceof User) {
            await destroyUser(instance);
        } else if (instance instanceof Theme) {
            await destroyTheme(instance);
        } else if (instance.destroy) {
            await instance.destroy({ force: true });
        }
    }
}

module.exports = {
    ALL_SCOPES,
    BASE_URL,
    V1_BASE_URL,
    addThemeToTeam,
    addUserToTeam,
    addPluginToProduct,
    addProductToTeam,
    createChart,
    createCharts,
    createFolder,
    createFolders,
    createFoldersWithParent,
    createGuestSession,
    createPlugin,
    createProduct,
    createPublicChart,
    createTeam,
    createTeamWithUser,
    createTheme,
    createThemes,
    createUser,
    createSession,
    destroy,
    genNonExistentFolderId,
    genRandomChartId,
    genRandomFolderId,
    getChart,
    getCredentials,
    getProduct,
    getProductPlugin,
    getPublicChart,
    getTheme,
    setup,
    setUserData,
    withTeam,
    withTeamWithUser,
    withUser
};
