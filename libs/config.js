/**
 * Load config from a directory into a Sails app
 * @see sails/lib/hooks/moduleloader/index.js#L201-L270
 */

var buildDictionary = require('sails-build-dictionary');
var _ = require('lodash');

module.exports = function (sails, dir) {
    var data = {};

    buildDictionary.aggregate({
        dirname: dir,
        exclude: ['locales', 'local.js', 'local.json', 'local.coffee', 'local.litcoffee'],
        excludeDirs: /(locales|env)$/,
        filter: /(.+)\.(js|json|coffee|litcoffee)$/,
        identity: false
    }, function (err, result) {
        if (err) { throw err; }
        data['config/*'] = result;
    });

    var env = sails.config.environment || 'development';
    buildDictionary.aggregate({
        dirname: dir + '/env/' + env,
        optional: true,
        filter: /(.+)\.(js|json|coffee|litcoffee)$/,
        identity: false
    }, function (err, result) {
        if (err) { throw err; }
        data['config/env/**'] = result;
    })

    buildDictionary.aggregate({
        dirname: dir + '/env',
        filter: new RegExp("^" + env + "\\.(js|json|coffee|litcoffee)$"),
        optional: true,
        identity: false
    }, function (err, result) {
        if (err) { throw err; }
        data['config/env/*'] = result;
    });

    sails.config = _.merge(
        data['config/*'],
        data['config/env/**'],
        data['config/env/*'],
        sails.config,
        function (a, b) {
            if (_.isArray(a)) {
                return a.concat(b);
            }
        }
    );
};
