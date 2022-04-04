<?php

class DatawrapperPlugin_DemoDatasets extends DatawrapperPlugin {

    public function init() {
        $plugin = $this;
        foreach ($this->getDemoDatasets() as $key => $dataset) {
            // translate chart types
            $dataset['type'] = __($dataset['type']['key'], $dataset['type']['scope']);
            DatawrapperHooks::register(DatawrapperHooks::GET_DEMO_DATASETS, function() use ($dataset){
                return $dataset;
            });
        }

        Hooks::register(Hooks::PROVIDE_API, function() use ($plugin) {
            $datasets = $plugin->getDemoDatasets();
            return [
                'url' => 'demo-datasets',
                'method' => 'GET',
                'action' => function () use ($datasets) {
                    print json_encode($datasets);
                }
            ];
        });

    }

    function getDemoDatasets() {
        $datasets = json_decode(file_get_contents(__DIR__.'/datasets.json'), true);
        
        // only show tables datasets if URL starts with /table/
        if (substr($_SERVER['REQUEST_URI'] ?? '', 0, 7) === '/table/') {
            $datasets = array_filter($datasets, function($ds) {
                return $ds['presets']['type'] === 'tables';
            });
        }
        return $datasets;
    }
}
