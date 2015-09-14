/**
 * Load config from a directory into a Sails app
 */

var buildDictionary = require('sails-build-dictionary');
var _ = require('lodash');
var defaultOptions = require(__dirname + '/defaultOptions');

module.exports = function (sails, dir, options) {
    options = options || defaultOptions;
    
    buildDictionary.aggregate({
        dirname: dir,
        exclude: ['locales', 'local.js', 'local.json', 'local.coffee', 'local.litcoffee'],
        excludeDirs: /(locales|env)$/,
        filter: /(.+)\.(js|json|coffee|litcoffee)$/,
        identity: false
    }, function (err, configs) {
        var afterMergeCb = function (a, b) {
            if (_.isArray(a)) {
                return a.concat(b);
            }
        };

        if(options.mergingOrder === 'hook-app') {
            sails.config = _.merge(configs, sails.config, afterMergeCb);
        } else {
            sails.config = _.merge(sails.config, configs, afterMergeCb);
        }
    });
};
