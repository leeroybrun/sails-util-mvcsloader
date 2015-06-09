/**
 * Load config from a directory into a Sails app
 */

var buildDictionary = require('sails-build-dictionary');
var _ = require('lodash');
module.exports = function (sails, dir) {
    buildDictionary.aggregate({
        dirname: dir,
        exclude: ['locales', 'local.js', 'local.json', 'local.coffee', 'local.litcoffee'],
        excludeDirs: /(locales|env)$/,
        filter: /(.+)\.(js|json|coffee|litcoffee)$/,
        identity: false
    }, function (err, configs) {
        sails.config = _.merge(configs, sails.config, function (a, b) {
            if (_.isArray(a)) {
                return a.concat(b);
            }
        });
    });
};
