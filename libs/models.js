/**
 * Load models from a directory into a Sails app
 */

var buildDictionary = require('sails-build-dictionary');
var defaultOptions = require(__dirname + '/defaultOptions');

module.exports = function (sails, dir, options, cb) {
    options = options || defaultOptions;
    cb = (typeof options === 'function' && !cb) ? options : cb; // No options, but callback instead
    cb = cb || function(){};
    
    buildDictionary.optional({
        dirname: dir,
        filter: /^([^.]+)\.(js|coffee|litcoffee)$/,
        replaceExpr: /^.*\//,
        flattenDirectories: true
    }, function (err, models) {
        if (err) {
            return cb(err);
        }
        
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

            var finalModels = sails.util.merge(models, supplements);

            if(options.mergingOrder === 'hook-app') {
                sails.models = sails.util.merge(finalModels || {}, sails.models || {});
            } else {
                sails.models = sails.util.merge(sails.models || {}, finalModels || {});
            }

            cb();
        });
    });
};
