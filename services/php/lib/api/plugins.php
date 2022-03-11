<?php

/*
 * this API endpoint allows plugins to provide custom
 * API actions
 */


$pluginApiHooks = DatawrapperHooks::execute(DatawrapperHooks::PROVIDE_API, $app);

if (!empty($pluginApiHooks)) {
    foreach ($pluginApiHooks as $hook) {
        $app->map('/plugin/' . $hook['url'], $hook['action'])
            ->via($hook['method'] ?? 'GET')
            ->conditions($hook['conditions'] ?? []);
    }
}

