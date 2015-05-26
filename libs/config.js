/**
 * Load config from a directory into a Sails app
 */

var buildDictionary = require('sails-build-dictionary');

module.exports = function (sails, dir) {
    buildDictionary.aggregate({
        dirname: dir,
        exclude: ['locales', 'local.js', 'local.json', 'local.coffee', 'local.litcoffee'],
        excludeDirs: /(locales|env)$/,
        filter: /(.+)\.(js|json|coffee|litcoffee)$/,
        identity: false
    }, function (err, configs) {
        sails.config = sails.util.merge(configs, sails.config);
    });
};
