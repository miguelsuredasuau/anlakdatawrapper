<?php
// This file generated by Propel 1.6.9 convert-conf target
// from XML runtime conf file /Users/gka/clients/datawrapper/1.0/lib/core/runtime-conf.xml
$conf = array (
  'datasources' =>
  array (
    'datawrapper' =>
    array (
      'adapter' => 'mysql',
      'connection' =>
      array (
        'dsn' => 'mysql:host='. getenv('DW_DATABASE_HOST') . ';port=' . getenv('DW_DATABASE_PORT') . ';dbname='. getenv('DW_DATABASE_NAME') . ';charset=utf8mb4',
        'user' => getenv('DW_DATABASE_USER'),
        'password' => getenv('DW_DATABASE_PASS'),
      ),
    ),
    'default' => 'datawrapper',
  ),
  'generator_version' => '1.6.9',
);
$conf['classmap'] = include(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'classmap-datawrapper-conf.php');
return $conf;
