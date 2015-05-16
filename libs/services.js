/**
 * Created by jaumard on 12/05/2015.
 */
var async = require('async');
var _ = require('lodash');
var buildDictionary = require('sails-build-dictionary');
var utils = require(__dirname + '/utils.js');
module.exports = function (sails, dir, cb) {
    async.waterfall([function loadServicesFromDirectory(next) {
        buildDictionary.optional({
            dirname: dir,
            filter: /^([^.]+)\.(js|coffee|litcoffee)$/,
            replaceExpr: /^.*\//,
            flattenDirectories: true
        }, next);
    }, function bindServicesToSails(modules, next) {
        utils._bindToSails(sails, modules, next);
    }, function injectServicesIntoSails(modules, next) {
        sails.services = _.merge(modules || {}, sails.services || {});
        if (sails.config.globals.services) {
            _.each(modules, function (service, serviceId) {
                global[service.globalId] = service;
            });
        }
        return next(null);
    }], function (err) {
        return cb(err);
    });
};
