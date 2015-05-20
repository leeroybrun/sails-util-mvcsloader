/**
 * Created by jaumard on 28/03/2015.
 */

module.exports = function (sails) {
    var loader = require("sails-util-mvcsloader")(sails);
    loader.injectAll({
        policies: __dirname + '/policies',// Path to your hook's policies
        config: __dirname + '/config'// Path to your hook's config
    });


    return {
        // Run when sails loads-- be sure and call `next()`.
        initialize: function (next) {
            loader.injectAll({
                controllers: __dirname + '/controllers', // Path to your hook's controllers
                models: __dirname + '/models', // Path to your hook's models
                services: __dirname + '/services' // Path to your hook's services
            }, function (err) {
                return next(err);
            });
        }
    };
};
