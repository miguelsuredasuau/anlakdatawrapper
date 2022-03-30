<?php

require_once ROOT_PATH . 'lib/utils/call_v3_api.php';

/*
 * UPLOAD STEP
 */
$app->get('/(chart|table)/:id/upload', function ($id) use ($app) {
    disable_cache($app);

    check_chart_writable($id, function($user, $chart) use ($app) {
        $datasets = DatawrapperHooks::execute(DatawrapperHooks::GET_DEMO_DATASETS);
        $groups = array();
        if (is_array($datasets)) {
            foreach ($datasets as $ds) {
                if (!$user->canCreateVisualization($ds['presets']['type'], $chart)) continue;
                if (!isset($groups[$ds['type']])) $groups[$ds['type']] = array('type' => $ds['type'], 'datasets' => array());
                $groups[$ds['type']]['datasets'][] = $ds;
            }
        }

        [$status, $rawChartJSON] = call_v3_api('GET', '/charts/'.$chart->getID(), null, 'application/json', false);

        $page = array(
            'title' => strip_tags($chart->getTitle()).' - '.$chart->getID() . ' - '.__('Upload Data'),
            'chartData' => $chart->loadData(),
            'rawChartJSON' => $rawChartJSON,
            'chart' => $chart,
            'datasets' => $groups,
            'readonly' => !$chart->isDataWritable($user)
        );
        add_header_vars($page, 'chart');
        add_editor_nav($page, 1, $chart);
        $res = $app->response();
        $res['Cache-Control'] = 'max-age=0';

        $page['svelte_data'] = [
            'chart' => $chart,
            'readonly' => !$chart->isDataWritable($user),
            'chartData' => $chart->loadData(),
            'datasets' => $groups,
            'user' => $user->serialize()
        ];

        $app->render('chart/upload.twig', $page);
    });
});
