/**
 * Load models from a directory into a Sails app
 */

var buildDictionary = require('sails-build-dictionary');

module.exports = function (sails, dir, cb) {
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

            if(sails.hooks && sails.hooks.orm){
              sails.hooks.orm.models = sails.util.merge(finalModels || {}, sails.hooks.orm.models || {});
              sails.models = sails.util.merge(finalModels || {}, sails.models || {});
            }else {
              sails.models = sails.util.merge(finalModels || {}, sails.models || {});
            }

            cb();
        });
    });
};
