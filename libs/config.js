/**
 * Load config from a directory into a Sails app
 */

var buildDictionary = require('sails-build-dictionary');
var async = require('async');

var _ = require('lodash');
module.exports = function (sails, dir) {
  async.auto({

    'config/*': function loadOtherConfigFiles (cb) {
      buildDictionary.aggregate({
        dirname: dir,
        exclude: ['locales', 'local.js', 'local.json', 'local.coffee', 'local.litcoffee'],
        excludeDirs: /(locales|env)$/,
        filter: /(.+)\.(js|json|coffee|litcoffee)$/,
        identity: false
      }, cb)
    },

    'config/local' : function loadLocalOverrideFile (cb) {
      buildDictionary.aggregate({
        dirname: dir,
        filter: /local\.(js|json|coffee|litcoffee)$/,
        identity: false
      }, cb);
    },

    'config/env/**': ['config/local', function loadEnvConfigFolder (cb) {
      var env = sails.config.environment || async_data['config/local'].environment || 'development';
      buildDictionary.aggregate({
        dirname: dir + '/env/' + env,
        optional: true,
        filter: /(.+)\.(js|json|coffee|litcoffee)$/,
        identity: false
      }, cb)
    }],

    'config/env/*' : ['config/local', function loadEnvConfigFile (cb, async_data) {
      var env = sails.config.environment || async_data['config/local'].environment || 'development';
      buildDictionary.aggregate({
        dirname: dir + '/env',
        filter: new RegExp("^" + env + "\\.(js|json|coffee|litcoffee)$"),
        optional: true,
        identity: false
      }, cb);
    }]

  }, function (err, async_data) {

    if (err) { throw err; }

    // Merge the configs, with env/*.js files taking precedence over others, and local.js
    // taking precedence over everything
    var configs = _.merge(
        async_data['config/*'],
        async_data['config/env/**'],
        async_data['config/env/*'],
        async_data['config/local']
    );

    sails.config = _.merge(configs, sails.config, function (a, b) {
      if (_.isArray(a)) {
        return a.concat(b);
      }
    });

  });

};
