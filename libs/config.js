/**
 * Load config from a directory into a Sails app
 */

var _ = require('lodash');
module.exports = function (sails, dir) {
    var configs = require('include-all')({
        dirname: dir,
        exclude: ['locales', 'local.js', 'local.json', 'local.coffee', 'local.litcoffee'],
        filter: /(.+)\.(js|json|coffee|litcoffee)$/,
        excludeDirs: /(locales|env)$/,
    });

    sails.config = _.merge(configs, sails.config, function (a, b) {
        if (_.isArray(a)) {
            return a.concat(b);
        }
    });
};
