/**
 * Created by jaumard on 28/03/2015.
 */

module.exports = function (sails) {
    var loader = require("sails-util-mvcsloader")(sails);
    loader.configure(); // Load policies and config

    /*
     OR if you want to set custom path :
     loader.configure({
     policies: __dirname + '/api/policies',// Path to your hook's policies
     config: __dirname + '/config'// Path to your hook's config
     });
     */

    return {
        initialize: function (next) {
            loader.adapt(function (err) {
                return next(err);
            });

            /*
             OR if you want to set custom path :
             loader.adapt(function (err) {
             return next(err);
             },{
             controllers: __dirname + '/api/controllers', // Path to your hook's controllers
             models: __dirname + '/api/models', // Path to your hook's models
             services: __dirname + '/api/services' // Path to your hook's services
             });
             */
        }
    };
};
