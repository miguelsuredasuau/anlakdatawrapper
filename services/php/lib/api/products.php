<?php
/*
 * add plugin to product
 */
$app->post('/products/:id/plugins', function($id) use ($app) {
    if (!check_scopes(['product:write'])) return;
    if_is_admin(function() use ($app, $id) {
        $product = ProductQuery::create()->findPk($id);

        if (!$product) {
            return error('unknown-product', 'Product not found');
        }

        try {
            $data = json_decode($app->request()->getBody(), true);
            foreach ($data as $pid) {
                $plugin = PluginQuery::create()->findPk($pid);
                if ($plugin && $plugin->getEnabled()) {
                    $product->addPlugin($plugin);
                }
            }
            $product->save();
            ok();
        } catch (Exception $e) {
            error('io-error', $e->getMessage());
        }
    });
});
