<?php

require_once ROOT_PATH . 'lib/utils/call_v3_api.php';
define('REDIS_FEATURE_DEFAULTS', 'php:feature-flags:defaults');

/**
 * Skeleton subclass for representing a row from the 'organization' table.
 *
 *
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class Organization extends BaseOrganization
{

    public function hasPlugin($plugin) {
        return OrganizationQuery::create()
            ->filterById($this->getId())
            ->filterByPlugin($plugin)
            ->count() > 0;
    }

    public function hasUser($user) {
        return UserOrganizationQuery::create()
            ->filterByOrganization($this)
            ->filterByUser($user)
            ->filterByInviteToken('')
            ->count() > 0;
    }

    public function getAdmins() {
        return UserOrganizationQuery::create()
            ->filterByOrganization($this)
            ->filterByOrganizationRole(UserOrganizationPeer::ORGANIZATION_ROLE_ADMIN)
            ->filterByInviteToken('')
            ->find();
    }

    public function getOwner() {
        return UserOrganizationQuery::create()
            ->filterByOrganization($this)
            ->filterByOrganizationRole(UserOrganizationPeer::ORGANIZATION_ROLE_OWNER)
            ->findOne();
    }

    public function getRole($user) {
        return UserOrganizationQuery::create()
            ->filterByOrganization($this)
            ->filterByUser($user)
            ->findOne()
            ->getOrganizationRole();
    }

    public function setRole($user, $role) {
        $uo = UserOrganizationQuery::create()
            ->filterByOrganization($this)
            ->filterByUser($user)
            ->findOne();
        if ($uo) {
            $uo->setOrganizationRole($role)->save();
        }
    }

    public function getActiveUsers() {
        $crit = UserQuery::create()
            ->useUserOrganizationQuery()
            ->filterByInviteToken('')
            ->endUse();
        return $this->getUsers($crit);
    }

    public function getActiveUserCount() {
        return $this->countUsers(UserQuery::create()
            ->useUserOrganizationQuery()
            ->filterByInviteToken('')
            ->endUse());
    }

    public function getPendingUsers() {
        $crit = UserQuery::create()
            ->useUserOrganizationQuery()
            ->filterByInviteToken('', Criteria::NOT_EQUAL)
            ->endUse();
        return $this->getUsers($crit);
    }

    public function getPendingUserCount() {
        return $this->countUsers(UserQuery::create()
            ->useUserOrganizationQuery()
            ->filterByInviteToken('', Criteria::NOT_EQUAL)
            ->endUse());
    }


    public function getType() {
        $type = $this->getSettings('type');
        if (empty($type)) return 'dev';
        return $type;
    }

    /**
     * the default settings will be extended from to make sure
     * the settings object is complete
     *
     * make sure to keep in sync with libs/orm/models/Team.js
     */
    protected function getDefaultSettings() {
        $default = [
            'folders' => 'expanded',
            'default' => [
                'folder' => null,
                'locale' => null
            ],
            'webhook_url' => '',
            'webhook_enabled' => false,
            'slack_webhook_url' => '',
            'slack_enabled' => false,
            'msteams_webhook_url' => '',
            'msteams_enabled' => false,
            'ga_enabled' => false,
            'ga_id' => '',
            'downloadImageFormat' => 'full',
            'downloadFilenameTemplate' => '{{ title }}',
            'embed' => [
                'preferred_embed' => 'responsive',
                'custom_embed' => [
                    'title' => '',
                    'text' => '',
                    'template' => ''
                ]
            ],
            'customFields' => [],
            'sso' => [
                'enabled' => false,
                'protcol' => 'openId',
                'automaticProvisioning' => true,
                'openId' => [
                    'domain' => '',
                    'clientId' => '',
                    'clientSecret' => ''
                ],
                'saml' => [
                    'url' => '',
                    'entityId' => '',
                    'certificate' => '',
                    'disableRequestedAuthnContext' => false
                ]
            ],
            'disableVisualizations' => [
                'enabled' => false,
                'visualizations' => new stdClass(),
                'allowAdmins' => false
            ],
            'pdfUpload' => [
                'ftp' => [
                    'enabled' => false,
                    'server' => "",
                    'user' => "",
                    'password' => "",
                    'directory' => "",
                    'filename' => ""
                ],
                's3' => [
                    'enabled' => false,
                    'bucket' => "",
                    'region' => "",
                    'accessKeyId' => "",
                    'secret' => "",
                    'prefix' => "",
                    'filename' => ""
                ]
            ],
            'restrictDefaultThemes' => false,
            'css' => '',
            'flags' => [],
            'displayLocale' => false,
            'displayCustomField' => [
                'enabled' => false,
                'key' => ""
            ]
        ];

        // TODO: cache in redis
        if (Redis::isInitialized()) {
            $defaultFlags = Redis::get(REDIS_FEATURE_DEFAULTS);
            if (!empty($defaultFlags)) {
                $defaultFlags = json_decode($defaultFlags, true);
            } else {
                // read default flags from v3 API
                [$status, $defaultFlags] = call_v3_api('GET', '/admin/default-features');
                // and store in Redis for 60 seconds
                Redis::set(REDIS_FEATURE_DEFAULTS, json_encode($defaultFlags), 60);
            }
        } else {
            // read default flags from v3 API
            [$status, $defaultFlags] = call_v3_api('GET', '/admin/default-features');
        }

        foreach ($defaultFlags as $flag) {
            $default['flags'][$flag['id']] = $flag['default'];
        }

        return $default;
    }

    public function getSettings($key = null) {
        $default = $this->getDefaultSettings();
        if ($this->settings == null) {
            $settings = [];
        } else {
            $settings = json_decode($this->settings, true);
            if (!is_array($settings)) $settings = array();
        }
        $settings = array_replace_recursive($default, $settings);

        if (empty($key)) return $settings;
        $keys = explode('.', $key);
        $p = $settings;
        foreach ($keys as $key) {
            if (isset($p[$key])) $p = $p[$key];
            else return null;
        }
        return $p;
    }

    public function updateSettings($key, $value) {
        $meta = $this->getSettings();
        $keys = explode('.', $key);
        $p = &$meta;
        foreach ($keys as $key) {
            if (!isset($p[$key])) {
                $p[$key] = array();
            }
            $p = &$p[$key];
        }
        $p = $value;
        $this->setSettings(json_encode($meta));
    }

    /*
     * returns an Array serialization with less
     * sensitive information than $user->toArray()
     */
    public function serialize() {
        return array(
            'id' => $this->getId(),
            'name' => $this->getName()
        );
    }

    public function getChartCount() {
        return ChartQuery::create()
            ->filterByDeleted(false)
            ->filterByOrganization($this)
            ->count();
    }

}
