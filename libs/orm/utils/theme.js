const Theme = require('../models/Theme');

/**
 * in some scenarios it might not be efficient to query themes
 * with all their parent data individually as some themes would
 * get queried multiple times.
 * this implementation provides a single-query alternative by
 * loading all themes first and then using them to resolve the
 * theme data dependencies.
 */
module.exports.getAllMergedThemes = (...args) => Theme.getAllMergedThemes(...args);
