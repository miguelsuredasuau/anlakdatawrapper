const models = {};
const modelsList = [];
const associationsList = [];

[
    'AccessToken',
    'Action',
    'Chart',
    'ChartPublic',
    'ChartAccessToken', // deprecated
    'ExportJob',
    'Folder',
    'Plugin',
    'PluginData',
    'Product',
    'ProductPlugin',
    'ReadonlyChart',
    'Schema',
    'Session',
    'Stats',
    'Team',
    'TeamProduct',
    'TeamTheme',
    'Theme',
    'User',
    'UserData',
    'UserPluginCache',
    'UserProduct',
    'UserTeam'
].forEach(k => {
    const model = require('./' + k);
    modelsList.push(model);
    models[k] = model;
});

['folder-chart', 'folder-team', 'folder-user', 'team-chart', 'user-chart', 'user-theme'].forEach(
    k => {
        associationsList.push(require('./assoc/' + k));
    }
);

exports.models = models;
exports.initModels = ORM => {
    for (const model of modelsList) {
        model.dwORM$setInitializerArguments(ORM);
    }

    for (const model of modelsList) {
        model.dwORM$ensureModelInitialized();
    }

    for (const association of associationsList) {
        association.init(ORM);
    }
};
