const Boom = require('@hapi/boom');
const Joi = require('joi');
const set = require('lodash/set');
const { Op } = require('@datawrapper/orm').db;
const { Chart, User, Folder, Team } = require('@datawrapper/orm/models');
const prepareChart = require('@datawrapper/service-utils/prepareChart');

module.exports = {
    name: 'routes/edit',
    version: '1.0.0',
    register: async server => {
        server.methods.prepareView('edit/Index.svelte');

        //
        // allow plugins to register additional workflows
        //
        const editWorkflows = [];
        const editWorkflowSteps = new Map();
        server.method('registerEditWorkflow', workflow => {
            editWorkflows.push(workflow);
            workflow.steps.forEach(step => {
                editWorkflowSteps.set(`${workflow.id}.${step.id}`, step);
            });
        });

        // register default chart workflow
        server.methods.registerEditWorkflow({
            id: 'chart',
            prefix: 'chart',
            steps: [
                {
                    id: 'upload',
                    view: 'edit/chart/upload',
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
                    async data({ request, chart }) {
                        let showLocaleSelect = true;
                        if (chart.organization_id) {
                            const team = await chart.getTeam();
                            if (team.settings?.flags?.output_locale === false) {
                                showLocaleSelect = false;
                            }
                        }
                        return {
                            showLocaleSelect,
                            readonly: !(await chart.isDataEditableBy(
                                request.auth.artifacts,
                                request.auth.credentials.session
                            ))
                        };
                    }
                },
                {
                    id: 'visualize',
                    view: 'edit/chart/visualize',
                    title: ['Visualize', 'core'],
                    async data() {}
                },
                {
                    id: 'publish',
                    view: 'edit/chart/publish',
                    title: ['Publish & Embed', 'core'],
                    async data() {}
                }
            ]
        });

        // register view components for chart workflow
        server.methods.registerViewComponent({
            id: 'edit/chart/upload',
            page: 'edit/Index.svelte',
            view: 'edit/steps/Upload.svelte'
        });

        server.methods.registerViewComponent({
            id: 'edit/chart/describe',
            page: 'edit/Index.svelte',
            view: 'edit/steps/Describe.svelte'
        });

        server.methods.registerViewComponent({
            id: 'edit/chart/visualize',
            page: 'edit/Index.svelte',
            view: 'edit/steps/Visualize.svelte'
        });

        server.methods.registerViewComponent({
            id: 'edit/chart/publish',
            page: 'edit/Index.svelte',
            view: 'edit/steps/Publish.svelte'
        });

        server.route({
            method: 'GET',
            path: '/v2/{prefix}/{chartId}/{step?}',
            options: {
                validate: {
                    params: Joi.object({
                        prefix: Joi.string().valid('edit', 'chart', 'map', 'table'),
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
                    const chart = await getChart(params.chartId, request);

                    const vis = server.app.visualizations.get(chart.type);
                    const workflow = editWorkflows.find(w => w.id === (vis.workflow || 'chart'));
                    const __ = server.methods.getTranslate(request);

                    if (!workflow) {
                        throw Boom.notImplemented('unknown workflow ' + vis.workflow);
                    }
                    // allowPrefix is set to 'chart' for d3-maps, for which we (for now) still want to allow access to the chart
                    // upload & describe steps
                    if (
                        workflow.prefix &&
                        ![workflow.prefix, workflow.allowPrefix].includes(params.prefix)
                    ) {
                        return h.redirect(`/${workflow.prefix}/${params.chartId}/${params.step}`);
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

                    if (!workflowSteps.find(step => step.id === params.step)) {
                        params.step = workflow.steps[0];
                    }

                    // evaluate data function for each step
                    for (const step of workflowSteps) {
                        // @todo: remove `step.id === params.step` check to pre-load
                        // data for all steps in single-page editor
                        if (step.id === params.step && typeof step.data === 'function') {
                            step.data = await step.data({ request, chart });
                        }
                    }

                    const api = server.methods.createAPI(request);

                    // refresh external data
                    await api(`/charts/${chart.id}/data/refresh`, { method: 'POST', json: false });
                    const data = await api(`/charts/${chart.id}/data`, { json: false });

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
                        request
                    });

                    return h.view('edit/Index.svelte', {
                        htmlClass: 'has-background-white-ter',
                        props: {
                            rawChart: await prepareChart(chart),
                            rawData: data,
                            initUrlStep: params.step,
                            urlPrefix: `/${params.prefix}`,
                            breadcrumbPath,
                            workflow: {
                                ...workflow,
                                steps: workflowSteps
                            },
                            visualizations: Array.from(server.app.visualizations.keys()).map(key =>
                                server.app.visualizations.get(key)
                            ),
                            customViews
                        }
                    });
                }
            }
        });

        async function getChart(id, request) {
            const isAdmin = server.methods.isAdmin(request);
            const options = {
                where: {
                    id,
                    deleted: { [Op.not]: true }
                }
            };
            if (isAdmin) {
                set(options, ['include'], [{ model: User, attributes: ['name', 'email'] }]);
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

        server.methods.prepareView('edit/App.svelte');
    }
};
