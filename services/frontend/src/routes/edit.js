const Boom = require('@hapi/boom');
const Joi = require('joi');
const get = require('lodash/get');
const set = require('lodash/set');
const cloneDeep = require('lodash/cloneDeep');
const { getNestedObjectKeys, byOrder } = require('../utils');
const { Op } = require('@datawrapper/orm').db;
const { Chart, User, Folder, Team, Theme } = require('@datawrapper/orm/models');
const prepareChart = require('@datawrapper/service-utils/prepareChart');
const assign = require('assign-deep');
const prepareVisualization = require('@datawrapper/service-utils/prepareVisualization');
const { loadVendorLocales, loadLocaleMeta } = require('@datawrapper/service-utils/loadLocales');

module.exports = {
    name: 'routes/edit',
    version: '1.0.0',
    register: async server => {
        // allow plugins to register additional workflows
        const editWorkflows = [];
        const editWorkflowSteps = new Map();
        const defaultWorkflowOptions = {
            /**
             * set to true to hide chart type selector in visualize step
             */
            hideChartTypeSelector: false,
            /**
             * list other workflow ids to include more visualizations
             * in the chart type selector
             */
            includeInChartTypeSelector: []
        };

        server.method('registerEditWorkflow', workflow => {
            workflow.options = { ...defaultWorkflowOptions, ...(workflow.options || {}) };
            editWorkflows.push(workflow);
            workflow.steps.forEach(step => {
                editWorkflowSteps.set(`${workflow.id}.${step.id}`, step);
            });
        });

        server.method('getEditWorkflows', () => {
            return editWorkflows;
        });

        server.method(
            'getLayoutControlGroups',
            async ({ chart, productFeatures, request, teamSettings, theme, user }) => {
                const { controls } = await server.methods.getCustomData('edit/visualize/layout', {
                    chart,
                    productFeatures,
                    request,
                    teamSettings,
                    theme,
                    user
                });
                const visibleControls = controls.filter(c => c.visible === undefined || c.visible);
                return [
                    {
                        title: null,
                        controls: visibleControls.filter(c => c.group === 'top')
                    },
                    {
                        title: 'layout / group-layout',
                        controls: visibleControls.filter(c => c.group === 'layout')
                    },
                    {
                        title: 'layout / group-footer',
                        controls: visibleControls.filter(c => c.group === 'footer')
                    },
                    {
                        title: 'layout / group-sharing',
                        controls: visibleControls.filter(c => c.group === 'sharing')
                    }
                ];
            }
        );

        // register default chart workflow
        server.methods.registerEditWorkflow({
            id: 'chart',
            prefix: 'chart',
            steps: [
                {
                    id: 'upload',
                    view: 'edit/chart/upload',
                    isDataStep: true,
                    title: ['Upload Data', 'core'],
                    async data({ request, chart }) {
                        const datasets = await server.methods.getDemoDatasets({ request, chart });
                        const uploadAfterContent = await server.methods.getCustomHTML(
                            'edit/upload/afterContent',
                            { request }
                        );
                        const additionalData = await server.methods.getCustomData('edit/upload', {
                            request
                        });
                        return {
                            datasets,
                            uploadAfterContent,
                            ...additionalData
                        };
                    }
                },
                {
                    id: 'describe',
                    view: 'edit/chart/describe',
                    title: ['Check & Describe', 'core'],
                    async data({ team }) {
                        let showLocaleSelect = true;
                        if (team && team.settings?.flags?.output_locale === false) {
                            showLocaleSelect = false;
                        }
                        return {
                            showLocaleSelect
                        };
                    }
                },
                {
                    id: 'visualize',
                    view: 'edit/chart/visualize',
                    title: ['Visualize', 'core'],
                    async data({ request, team, chart, theme, productFeatures }) {
                        const { controls, previewWidths, customFields, flags } = assign(
                            {
                                // extend flags from default feature flags
                                flags: Object.fromEntries(
                                    server.methods
                                        .getFeatureFlags()
                                        .map(({ id, default: defValue }) => [id, defValue])
                                ),
                                controls: {},
                                previewWidths: [],
                                customFields: []
                            },
                            cloneDeep(team?.settings || {})
                        );
                        const user = request.auth.artifacts;
                        const layoutControlsGroups = await server.methods.getLayoutControlGroups({
                            chart,
                            productFeatures,
                            request,
                            teamSettings: { flags },
                            theme,
                            user
                        });

                        const api = server.methods.createAPI(request);
                        const isAdmin = user.isAdmin();
                        let themes = isAdmin
                            ? await Theme.findAll({ attributes: ['id', 'title', 'created_at'] })
                            : (await api('/themes')).list;

                        if (!isAdmin && team?.settings?.restrictDefaultThemes) {
                            const defaultThemes =
                                server.methods.config('general').defaultThemes || [];
                            themes = themes.filter(({ id }) => !defaultThemes.includes(id));
                        }

                        return {
                            themes,
                            layoutControlsGroups,
                            teamSettings: {
                                flags,
                                controls,
                                previewWidths,
                                customFields
                            }
                        };
                    }
                },
                {
                    id: 'publish',
                    view: 'edit/chart/publish',
                    title: ['Publish & Embed', 'core'],
                    async data({ request, chart, theme }) {
                        const { svelte2: afterEmbed } = await server.methods.getCustomData(
                            'edit/publish/afterEmbed',
                            {
                                request,
                                chart
                            }
                        );
                        const guestAboveInvite = await server.methods.getCustomHTML(
                            'edit/publish/guestAboveInvite',
                            { request }
                        );
                        const guestBelowInvite = await server.methods.getCustomHTML(
                            'edit/publish/guestBelowInvite',
                            { request }
                        );
                        const api = server.methods.createAPI(request);
                        // fetch embed types from API
                        const embedTemplates = await api(`/charts/${chart.id}/embed-codes`);
                        const embedType = (
                            embedTemplates.find(tpl => tpl.preferred) || { id: 'responsive ' }
                        ).id;
                        // fetch display urls from API
                        const displayURLs = await api(`/charts/${chart.id}/display-urls`);

                        const chartActions = await server.methods.getChartActions({
                            request,
                            chart,
                            theme
                        });

                        return {
                            afterEmbed,
                            guestAboveInvite,
                            guestBelowInvite,
                            embedTemplates,
                            embedType,
                            displayURLs,
                            chartActions,
                            needsRepublish:
                                chart.last_edit_step > 4 &&
                                chart.last_modified_at - chart.published_at > 20000
                        };
                    }
                }
            ]
        });

        // register core layout controls
        server.methods.registerCustomData(
            'edit/visualize/layout',
            async ({ productFeatures, teamSettings }) => {
                const { flags } = teamSettings;
                const { enableCustomLayouts } = productFeatures;
                return {
                    controls: [
                        {
                            component: 'edit/chart/visualize/layout/locale',
                            props: {},
                            group: 'top'
                        },
                        {
                            component: 'edit/chart/visualize/layout/embed',
                            visible: (flags && flags.embed) || !flags,
                            props: {},
                            group: 'footer',
                            priority: 10
                        },
                        {
                            component: 'edit/chart/visualize/layout/data',
                            visible: (flags && flags.get_the_data) || !flags,
                            props: {},
                            group: 'footer',
                            priority: 0
                        },
                        {
                            component: 'edit/chart/visualize/layout/logo',
                            visible: true,
                            props: {
                                // in the latter case we'll use this as upsell promo
                                requireUpgrade: !enableCustomLayouts
                            },
                            group: 'layout',
                            priority: 2
                        },
                        {
                            component: 'edit/chart/visualize/layout/darkMode',
                            group: 'layout',
                            priority: 5
                        },
                        {
                            component: 'edit/chart/visualize/layout/theme',
                            visible: (flags && flags.layout_selector) || !flags,
                            props: {},
                            group: 'layout',
                            priority: 0
                        }
                    ]
                };
            }
        );

        ['chart', 'map', 'table', 'edit'].map(prefix => {
            editRoute(prefix);
            if (prefix === 'edit' || prefix === 'map') {
                // add /v2/ alias for edit route
                editRoute(prefix, true);
            }
        });

        function editRoute(prefix, v2 = false) {
            server.route({
                method: 'GET',
                path: `/${v2 ? 'v2/' : ''}${prefix}/{chartId}/{step?}`,
                options: {
                    validate: {
                        params: Joi.object({
                            chartId: Joi.string()
                                .alphanum()
                                .length(5)
                                .required()
                                .description('5 character long chart ID.'),
                            step: Joi.string().alphanum()
                        })
                    },
                    auth: 'guest',
                    async handler(request, h) {
                        const { params } = request;
                        const user = request.auth.artifacts;
                        const chart = await getChart(params.chartId, request);

                        const vis = server.app.visualizations.get(chart.type);
                        if (!vis) {
                            throw Boom.badRequest('Unknown chart type');
                        }
                        const workflow = editWorkflows.find(
                            w => w.id === (vis.workflow || 'chart')
                        );
                        const __ = server.methods.getTranslate(request);

                        let team = null;
                        if (chart.organization_id) {
                            team = await chart.getTeam();
                        }

                        const teamProducts = team ? await team.getProducts() : [];
                        const products =
                            teamProducts.length > 0
                                ? teamProducts
                                : [await user.getActiveProduct()];

                        const productFeatures = Object.fromEntries(
                            [
                                'enableCustomLayouts',
                                'requireDatawrapperAttribution',
                                'enableWebToPrint'
                            ].map(key => [key, !!products.find(product => product.hasFeature(key))])
                        );

                        if (!workflow) {
                            throw Boom.notImplemented('unknown workflow ' + vis.workflow);
                        }
                        // allowPrefix is set to 'chart' for d3-maps, for which we (for now) still want to allow access to the chart
                        // upload & describe steps
                        // TODO: remove this hack once new symbol map upload is live
                        if (
                            workflow.prefix &&
                            ![workflow.prefix, workflow.allowPrefix].includes(prefix)
                        ) {
                            return h.redirect(
                                `/${workflow.prefix}/${params.chartId}/${params.step}`
                            );
                        }

                        // replace step references with registered steps from other
                        // workflows, so that plugins can re-use core steps
                        // shallow-clone step objects to retain original objects
                        // for future requests
                        const workflowSteps = workflow.steps
                            .map(step => {
                                if (step.ref) {
                                    if (editWorkflowSteps.has(step.ref)) {
                                        const workflowStep = { ...editWorkflowSteps.get(step.ref) };
                                        if (step.hide) workflowStep.hide = step.hide;
                                        return workflowStep;
                                    }
                                    throw Boom.notImplemented(
                                        'unknown workflow step reference: ' + step.ref
                                    );
                                }
                                return step;
                            })
                            .map(step => ({ ...step }));

                        // for now we still let users access chart steps for maps, but these are hidden
                        const visibleWorkflowSteps = workflowSteps.filter(step => !step.hide);

                        if (params.step === 'edit') {
                            // auto-redirect to correct step from lastEditStep
                            return h.redirect(
                                `/${workflow.prefix}/${params.chartId}/${
                                    visibleWorkflowSteps[Math.min(2, chart.last_edit_step)].id
                                }`
                            );
                        }
                        if (!workflowSteps.find(step => step.id === params.step)) {
                            params.step = workflowSteps[0].id;
                        }

                        const api = server.methods.createAPI(request);

                        // refresh external data...
                        if (
                            // ...if the upload method isn't copy-paste or file upload
                            get(chart, 'metadata.data.upload-method') !== 'copy' ||
                            // ...if the chart is in "print mode", which means we want to
                            // synchronize the dataset from the "web mode" chart
                            get(chart, 'metadata.custom.webToPrint.mode') === 'print'
                        ) {
                            await api(`/charts/${chart.id}/data/refresh`, {
                                method: 'POST',
                                json: false
                            });
                        }

                        // load things from API
                        const [theme, data] = await Promise.all([
                            await api(`/themes/${chart.theme}?extend=true`),
                            await api(`/charts/${chart.id}/data`, { json: false })
                        ]);

                        // evaluate data function for each step
                        await Promise.all(
                            workflowSteps
                                .filter(step => typeof step.data === 'function')
                                .map(async step => {
                                    step.data = await step.data({
                                        request,
                                        chart,
                                        theme,
                                        team,
                                        productFeatures
                                    });
                                })
                        );

                        const breadcrumbPath = [
                            chart.organization_id
                                ? {
                                      title: (await Team.findByPk(chart.organization_id)).name,
                                      url: `/archive/team/${chart.organization_id}`,
                                      svgIcon: 'folder-shared'
                                  }
                                : {
                                      title: __('archive / my-archive'),
                                      url: '/archive',
                                      svgIcon: 'folder-user'
                                  }
                        ];
                        // compute breadcrumb path
                        let folderId = chart.in_folder;
                        while (folderId) {
                            const folder = await Folder.findByPk(folderId);
                            breadcrumbPath.splice(1, 0, {
                                title: folder.name,
                                url: `${breadcrumbPath[0].url}/${folder.id}`,
                                svgIcon: 'folder'
                            });
                            folderId = folder.parentId;
                        }

                        const customViews = await server.methods.getCustomData('edit/customViews', {
                            request,
                            chart,
                            user,
                            productFeatures
                        });

                        const rawChart = await prepareChart(chart);

                        const disabledFields = await applyExternalMetadata(api, rawChart);

                        // check if this is an admin accessing a chart by someone else
                        const showAdminWarning =
                            user.isAdmin() &&
                            user.id !== chart.author_id &&
                            !(await user.hasActivatedTeam(chart.organization_id));

                        const localeMeta = await loadLocaleMeta();
                        const chartLocales = server.methods.config('general').locales;
                        chartLocales.forEach(locale => {
                            Object.assign(
                                locale,
                                localeMeta[locale.id.toLowerCase()] || { textDirection: 'ltr' }
                            );
                        });
                        const chartLocaleIds = chartLocales.map(({ id }) => id);
                        const vendorLocales = {
                            dayjs: await loadVendorLocales('dayjs', chartLocaleIds),
                            numeral: await loadVendorLocales('numeral', chartLocaleIds)
                        };

                        const mayAdministrateTeam =
                            team && (await user.mayAdministrateTeam(team.id));

                        return h.view('edit/Index.svelte', {
                            htmlClass: 'has-background-white-bis',
                            analytics: {
                                team: team ? team.id : null
                            },
                            props: {
                                rawChart,
                                rawData: data,
                                rawTeam: team,
                                rawLocales: chartLocales,
                                rawVendorLocales: vendorLocales,
                                initUrlStep: params.step,
                                urlPrefix: `/${v2 ? 'v2/' : ''}${prefix}`,
                                breadcrumbPath,
                                workflow: {
                                    ...workflow,
                                    steps: workflowSteps
                                },
                                rawTheme: theme,
                                visualizations: Array.from(server.app.visualizations.values())
                                    .filter(
                                        vis =>
                                            !isDisabledVisualization(vis, team, mayAdministrateTeam)
                                    )
                                    .map(prepareVisualization)
                                    .sort(byOrder),
                                customViews,
                                showEditorNavInCmsMode: get(
                                    user.activeTeam,
                                    'settings.showEditorNavInCmsMode',
                                    false
                                ),
                                rawReadonlyKeys: disabledFields,
                                showAdminWarning,
                                dataReadonly: !(await chart.isDataEditableBy(
                                    user,
                                    request.auth.credentials.session
                                ))
                            }
                        });
                    }
                }
            });
        }

        async function getChart(id, request) {
            const isAdmin = server.methods.isAdmin(request);
            const options = {
                where: {
                    id,
                    deleted: { [Op.not]: true }
                }
            };
            if (isAdmin) {
                set(options, ['include'], [{ model: User, attributes: ['id', 'name', 'email'] }]);
            }
            const chart = await Chart.findOne(options);
            const isEditable =
                chart &&
                (await chart.isEditableBy(
                    request.auth.artifacts,
                    request.auth.credentials.session
                ));
            if (!isEditable) {
                throw Boom.notFound("Whoops! We couldn't find that visualization...", {
                    text: `Sorry, but it seems that there is no visualization with the id ${id} (anymore)`
                });
            }
            return chart;
        }

        function isDisabledVisualization(vis, team, mayAdministrateTeam) {
            if (!team) return false;

            const disabledVisSettings = team.settings?.disableVisualizations || {};

            if (!disabledVisSettings.enabled) {
                return false;
            }
            if (disabledVisSettings.allowAdmins && mayAdministrateTeam) {
                return false;
            }
            return disabledVisSettings.visualizations[vis.id];
        }
    }
};

/**
 * loads external metadata, applies the changes to rawChart and returns
 * a list of keys that should be readonly because they are now controlled
 * via external metadata
 *
 * @param {object} api  - api instance created with server.methods.createAPI()
 * @param {*} rawChart
 * @returns {string[]} - list of readonly chart keys (e.g. "metadata.annotate.notes")
 */
async function applyExternalMetadata(api, rawChart) {
    // load external metadata if defined
    let externalMetadata = {};
    const readonlyFields = []; // fields controlled by external metadata
    if (
        get(rawChart, 'metadata.data.upload-method') === 'external-data' &&
        get(rawChart, 'metadata.data.external-metadata')
    ) {
        try {
            externalMetadata = await api(
                `/charts/${rawChart.id}/assets/${rawChart.id}.metadata.json`
            );
        } catch {
            // external metadata defined, but presumably doesn't point to a valid json
            // so there's no corresponding asset
        }
    }
    // special treatment for title since it's not part of metadata
    // but very useful to set externally in a live context
    if (externalMetadata.title !== undefined) {
        rawChart.title = externalMetadata.title;
        readonlyFields.push('title');
        delete externalMetadata.title;
    }
    readonlyFields.push(...getNestedObjectKeys(externalMetadata).map(key => `metadata.${key}`));
    // assign remaining metadata
    assign(rawChart.metadata, externalMetadata);
    return readonlyFields;
}
