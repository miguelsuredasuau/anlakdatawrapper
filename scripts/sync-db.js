const ORM = require('@datawrapper/orm');
const config = require('../config');

ORM.init(config);

// add missing tables without touching existing ones
require('@datawrapper/orm/models');
ORM.db.sync();
