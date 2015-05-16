/**
 * Created by jaumard on 12/05/2015.
 */
var async = require('async');
var _ = require('lodash');
var buildDictionary = require('sails-build-dictionary');
var utils = require(__dirname + '/utils.js');

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
            return next(null, models, supplements);
        });
    }, function bindSupplementsToSails(models, supplements, next) {
        utils._bindToSails(sails, supplements, function (err, supplements) {
            if (err) {
                return cb(err);
            }
            return next(null, _.merge(models, supplements));
        });
    }, function injectModelsIntoSails(modules, next) {
        sails.models = _.merge(modules || {}, sails.models || {});

        return next(null);
    }, function reloadSailsORM(next) {
        sails.hooks.orm.reload();

        return next(null);
    }], function (err) {
        return cb(err);
    });
};
