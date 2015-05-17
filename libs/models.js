/**
 * Created by jaumard on 12/05/2015.
 */
var async = require('async');
var _ = require('lodash');
var buildDictionary = require('sails-build-dictionary');

module.exports = function (sails, dir, cb) {
    async.waterfall([function loadModelsFromDirectory(next) {
        buildDictionary.optional({
            dirname: dir,
            filter: /^([^.]+)\.(js|coffee|litcoffee)$/,
            replaceExpr: /^.*\//,
            flattenDirectories: true
        }, next);
    }, function loadAttributesFromDirectory(models, next) {
        // Get any supplemental files
        buildDictionary.optional({
            dirname: dir,
            filter: /(.+)\.attributes.json$/,
            replaceExpr: /^.*\//,
            flattenDirectories: true
        }, function (err, supplements) {
            if (err) {
                return cb(err);
            }
            return next(null, _.merge(models, supplements));
        });
    }, function injectModelsIntoSails(modules, next) {
        sails.models = _.merge(modules || {}, sails.models || {});

        return next(null);
    }, function reloadSailsORM(next) {
        if (!sails.config.mvcsloader || (sails.config.mvcsloader && sails.config.mvcsloader.reloadORM)) {
            var d = require('domain').create();
            d.on('error', function (err) {
                // handle the error safely
                sails.log.error("mvcs-loader error, you have multiple hooks that try to reload orm, look here (https://github.com/jaumard/sails-util-mvcsloader/#troubles) to disable orm reload and do it manually on your bootstrap.js");
            });
            d.run(function () {
                sails.hooks.orm.reload();
            });
        }

        return next(null);
    }], function (err) {
        return cb(err);
    });
};
