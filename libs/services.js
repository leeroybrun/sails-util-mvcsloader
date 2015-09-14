/**
 * Load services from a directory into a Sails app
 */

var async = require('async');
var _ = require('lodash');
var buildDictionary = require('sails-build-dictionary');
var defaultOptions = require(__dirname + '/defaultOptions');

module.exports = function (sails, dir, options, cb) {
    options = options || defaultOptions;
    cb = (typeof options === 'function' && !cb) ? options : cb; // No options, but callback instead
    cb = cb || function(){};
    
    async.waterfall([function loadServicesFromDirectory(next) {
        buildDictionary.optional({
            dirname: dir,
            filter: /^([^.]+)\.(js|coffee|litcoffee)$/,
            replaceExpr: /^.*\//,
            flattenDirectories: true
        }, next);

    }, function injectServicesIntoSails(modules, next) {
        if(options.mergingOrder === 'hook-app') {
            sails.services = _.merge(modules || {}, sails.services || {});
        } else {
            sails.services = _.merge(sails.services || {}, modules || {});
        }
        
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
