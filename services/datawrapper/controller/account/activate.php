<?php
/*
 * check invitation token and show invited page
 */
$app->get('/account/invite/:token', function($token) use ($app) {
    disable_cache($app);
    _checkInviteTokenAndExec($token, function($user) use ($app) {
        $chartId = $app->request()->params('chart');

        $page = array(
            'email' => $user->getEmail(),
            'redirect' => '/',
            'message_h1' => __("invite / h1 / chart"),
            'message_p' => __("invite / p"),
            'message_button' => __('account / invite / set-password')
        );

        if (!empty($chartId)) {
            $chart = ChartQuery::create()->findPk($chartId);

            if ($chart) {
                $page['redirect'] = '/' . $chart->getNamespace()
                    . '/' . $chartId . '/publish';
            }

            $page["message_h1"] = __("invite / h1 / " . $chart->getNamespace());
        }

        add_header_vars($page, 'about', 'account/invite.css');
        $app->render('account/invite.twig', $page);
    });
});

/*
 * store new password, clear invitation token and login
 */
$app->post('/account/invite/:token', function($token) use ($app) {
    _checkInviteTokenAndExec($token, function($user) use ($app) {
        $data = json_decode($app->request()->getBody());
        $user->setPwd($data->pwd);
        $user->setActivateToken('');
        $user->setRole('editor');
        $user->save();
        // notify plugins about the newly activated user
        DatawrapperHooks::execute(DatawrapperHooks::USER_ACTIVATED, $user);
        DatawrapperSession::login($user);
        print json_encode(array('result' => 'ok'));
    });
});

function _checkInviteTokenAndExec($token, $func) {
    if (!empty($token)) {
        $user = UserQuery::create()->findOneByActivateToken($token);
        if ($user) {
            $func($user);
        } else {
            // this is not a valid token!
            $page['alert'] = array(
                'type' => 'error',
                'message' => __('The invitation token is invalid.')
            );
            global $app;
            $app->redirect('/');
        }
    }
}
