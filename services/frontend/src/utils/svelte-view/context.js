const { allScopes } = require('@datawrapper/service-utils/l10n');
const crypto = require('crypto');

const clientSideStoreCache = new Set(['messages']);

/*
 * set values for the global stores, based on request
 */
module.exports = async function (request) {
    const { server, auth } = request;
    const apiConfig = server.methods.config('api');
    const frontendConfig = server.methods.config('frontend');
    const generalConfig = server.methods.config('general');
    const userLang = server.methods.getUserLanguage(auth);
    const userData =
        auth.isAuthenticated && auth.artifacts && auth.artifacts.id
            ? await getUserData(server, auth.artifacts.id)
            : {};

    const userAgent = request.headers['user-agent'];

    const context = {
        stores: {
            config: {
                apiDomain: `${apiConfig.subdomain}.${apiConfig.domain}`,
                frontendDomain: `${frontendConfig.domain}`,
                imageDomain: `${generalConfig.imageDomain}`,
                dev: process.env.DW_DEV_MODE,
                footerLinks: frontendConfig.footerLinks || [],
                languages: frontendConfig.languages || [],
                headerLinks: await server.methods.getHeaderLinks(request),
                stickyHeaderThreshold: 800
            },
            browser: {
                isIE: userAgent.includes('MSIE') || userAgent.includes('Trident')
            },
            request: {
                method: request.method,
                url: request.url,
                path: request.path,
                params: request.params,
                referrer: request.info.referrer,
                query: request.query
            },
            user:
                auth.isAuthenticated && auth.artifacts && auth.artifacts.id
                    ? {
                          id: auth.artifacts.id,
                          name: auth.artifacts.name || auth.artifacts.email,
                          email: auth.artifacts.email,
                          language: userLang,
                          isAdmin: auth.artifacts.isAdmin(),
                          isGuest: false,
                          teams: auth.artifacts.teams.filter(team => !team.user_team.invite_token),
                          activeTeam: auth.artifacts.activeTeam,
                          isActivated: auth.artifacts.role !== 'pending'
                      }
                    : {
                          id: -1,
                          isGuest: true,
                          isAdmin: false,
                          language: userLang
                      },
            userData,
            messages: allScopes(userLang || 'en-US')
        },
        storeHashes: {},
        storeCached: {}
    };
    // check client-side cache in cookie
    if (request.state) {
        clientSideStoreCache.forEach(key => {
            const curHash = context.stores[key] ? md5(JSON.stringify(context.stores[key])) : null;
            context.storeHashes[key] = curHash;
            const clientHash = request.state[`DW-HASH-${key.toUpperCase()}`];
            if (clientHash && clientHash === curHash) {
                // the client aleady has a cache of the messages, let's not send them again
                // to save some bandwidth!
                context.storeCached[key] = true;
            }
        });
    }
    return context;
};

async function getUserData(server, userId) {
    const UserData = server.methods.getModel('user_data');
    return (
        await UserData.findAll({
            attributes: ['key', 'value'],
            where: {
                user_id: userId
            }
        })
    ).reduce((settings, row) => {
        const value = row.get('value');
        return { ...settings, [row.key]: value };
    }, {});
}

function md5(string) {
    return crypto.createHash('md5').update(string).digest('hex');
}
