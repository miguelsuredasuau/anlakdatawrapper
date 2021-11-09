<?php
/*
 * activate account after email change
 */
$app->get('/account/profile', function() use ($app) {
    disable_cache($app);

    $user = Session::getUser();

    if (!Session::getUser()->isLoggedIn()) {
        error_settings_need_login();
        return;
    }

    if ($app->request()->get('token')) {
        // look for action with this token
        $t = ActionQuery::create()
            ->filterByUser($user)
            ->filterByKey('email-change-request')
            ->orderByActionTime('desc')
            ->findOne();
        if (!empty($t)) {
            // check if token is valid
            $params = json_decode($t->getDetails(), true);
            if (!empty($params['token']) && $params['token'] == $app->request()->get('token')) {
                // token matches
                $user->setEmail($params['new-email']);
                $user->save();
                // clear token to prevent future changes
                $params['token'] = '';
                $t->setDetails(json_encode($params));
                $t->save();
            }
        }
    }

    $app->redirect('/account');
});
