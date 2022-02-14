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

$app->post('/products/:id/organizations', function($id) use ($app) {
    if (!check_scopes(['product:write'])) return;
    if_is_admin(function() use ($app, $id) {
        $product = ProductQuery::create()->findPk($id);
        if ($product) {
            $data = json_decode($app->request()->getBody(), true);
            $res  = array();
            foreach ($data as $newRelation) {
                $org = OrganizationQuery::create()->findPk($newRelation['id']);
                if ($org) {
                    $op = new OrganizationProduct();
                    $op->setOrganization($org);

                    if ($newRelation['expires']) {
                        $op->setExpires($newRelation['expires']);
                    }

                    $product->addOrganizationProduct($op);
                }
                $res[] = $op;
            }
            try {
                $product->save();
                ok($res);
            } catch (Exception $e) {
                error('io-error', $e->getMessage());
            }
        } else {
            return error('unknown-product', 'Product not found');
        }
    });
});

$app->put('/products/:id/organizations', function($id) use ($app) {
    if (!check_scopes(['product:write'])) return;
    if_is_admin(function() use ($app, $id) {
        $product = ProductQuery::create()->findPk($id);
        if ($product) {
            $data = json_decode($app->request()->getBody(), true);
            $res  = array();

            try {
                foreach ($data as $relation) {
                    $op = OrganizationProductQuery::create()
                            ->filterByProductId($id)
                            ->filterByOrganizationId($relation['id'])
                            ->findOne();
                    $op->setExpires($relation['expires']);
                    $op->save();
                }
                ok($res);
            } catch (Exception $e) {
                error('io-error', $e->getMessage());
            }
        } else {
            return error('unknown-product', 'Product not found');
        }
    });
});
