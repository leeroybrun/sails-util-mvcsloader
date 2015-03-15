var async = require('async');
var _ = require('lodash');
var buildDictionary = require('sails-build-dictionary');

module.exports = function(sails) {

	var _bindToSails = function(modules, cb) {
		_.each(modules, function(module) {
			// Add a reference to the Sails app that loaded the module
			module.sails = sails;
			// Bind all methods to the module context
			_.bindAll(module);
		});

		return cb(null, modules);
	};

	// https://github.com/balderdashy/sails/blob/0d2c2751f120d56135abdb90f465fb9782277011/lib/hooks/orm/normalize-model.js
	var _normalizeModel = function(modelDef, modelID) {
		// Rebuild model definition merging the following
	    // (in descending order of precedence):
	    //
	    // • explicit model def
	    // • sails.config.models
	    // • implicit framework defaults
		var newModelDef = _.merge({
			identity: modelID,
			tableName: modelID
		}, sails.config.models);
		newModelDef = _.merge(newModelDef, modelDef);

		// Keep an eye on merge's behavior w/ arrays here...
		// just to be safe, do:
		_.each(modelDef, function (val,key){
			if (_.isArray(val)) {
				newModelDef[key] = val;
			}
		});

		// Merge in modelDef connection setting
	    // (this is probably not necessary any more, see above-
	    //  leaving it in for now to be safe)
	    if (!newModelDef.connection && sails.config.models.connection) {
	    	newModelDef.connection = sails.config.models.connection;
	    }

	    // If this is production, force `migrate: safe`!!
		if (process.env.NODE_ENV === 'production' && newModelDef.migrate !== 'safe') {
			newModelDef.migrate = 'safe';
			sails.log.verbose(util.format('Forcing Waterline to use `migrate: "safe" strategy (since this is production)'));
		}

		// TODO: support backward compatibility ? https://github.com/balderdashy/sails/blob/0d2c2751f120d56135abdb90f465fb9782277011/lib/hooks/orm/normalize-model.js#L60-L69

		////////////////////////////////////////////////////////////////////////
	    // If it isn't set directly, set the model's `schema` property
	    // based on the first adapter in its connections (left -> right)
	    //
	    // TODO: pull this out and into Waterline core
	    // (this may already be the case- we need to try removing this and see
	    //  if it still works)
	    if (typeof newModelDef.schema === 'undefined') {
	      var connection, schema;
	      for (var i in newModelDef.connection) {
	        connection = newModelDef.connection[i];
	        // console.log('checking connection: ', connection);
	        if (typeof connection.schema !== 'undefined') {
	          schema = connection.schema;
	          break;
	        }
	      }
	      // console.log('trying to determine preference for schema setting..', newModelDef.schema, typeof modelDef.schema, typeof modelDef.schema !== 'undefined', schema);
	      if (typeof schema !== 'undefined') {
	        newModelDef.schema = schema;
	      }
	    }
	    ////////////////////////////////////////////////////////////////////////

	    return newModelDef;
	};

	return {

		defaults: {},

		initialize: function(cb) {
			return cb();
		},

		injectControllers: function(dir, cb) {

			async.waterfall([
				// Load controllers from the given directory
				function loadModulesFromDirectory(next) {
					buildDictionary.optional({
				        dirname: dir,
				        filter: /(.+)Controller\.(js|coffee|litcoffee)$/,
				        flattenDirectories: true,
				        keepDirectoryPath: true,
				        replaceExpr: /Controller/
				    }, next);
				},

				// Bind all controllers methods to sails
				function bindControllersToSails(modules, next) {
					_bindToSails(modules, next);
				},

				// Register controllers on the main "controllers" hook
				function registerControllers(modules, next) {
					// Extends sails.controllers with new ones
					sails.controllers = _.extend(sails.controllers || {}, modules);

					// Loop through each controllers and register them
					_.each(modules, function(controller, controllerId) {
						// If controller does not exists yet, create empty object
						sails.hooks.controllers.middleware[controllerId] = sails.hooks.controllers.middleware[controllerId] || {};

						// Register this controller's actions
						_.each(controller, function(action, actionId) {
							// actionid is always lowercase
							actionId = actionId.toLowerCase();

							// If the action is set to `false`, explicitly disable (remove) it
							if (action === false) {
								delete sails.hooks.controllers.middleware[controllerId][actionId];
								return;
							}

							// Do not register string or boolean actions
							if (_.isString(action) || _.isBoolean(action)) {
								return;
							}

							// Register controller's action on the main "controllers" hook
							action._middlewareType = 'ACTION: '+controllerId+'/'+actionId;
							sails.hooks.controllers.middleware[controllerId][actionId] = action;
				            sails.hooks.controllers.explicitActions[controllerId] = sails.hooks.controllers.explicitActions[controllerId] || {};
				            sails.hooks.controllers.explicitActions[controllerId][actionId] = true;
				        });
					});

					return next();
				}
			], function(err) {
				cb(err);
			});
		},

		injectModels: function(dir, cb) {
			async.waterfall([
				function loadModelsFromDirectory(next) {
					buildDictionary.optional({
						dirname   : dir,
						filter    : /^([^.]+)\.(js|coffee|litcoffee)$/,
						replaceExpr : /^.*\//,
						flattenDirectories: true
					}, next);
				},

				function loadAttributesFromDirectory(models, next) {
					// Get any supplemental files
					buildDictionary.optional({
						dirname   : dir,
						filter    : /(.+)\.attributes.json$/,
						replaceExpr : /^.*\//,
						flattenDirectories: true
					}, function(err, supplements) {
						if (err) { return cb(err); }
						return next(null, models, supplements);
					});
				},

				function bindSupplementsToSails(models, supplements, next) {
					_bindToSails(function(err, supplements) {
						if (err) { return cb(err); }
						return cb(null, _.merge(models, supplements));
					});
				},

				function injectModelsIntoSails(modules, next) {
					sails.models = _.extend(sails.models || {}, modules);

					_.each(modules, function (model, identifier) {
	    				sails.models[identifier] = _normalizeModel(model, identifier);
					});


				}

				
			], function(err) {
				return cb(err);
			});
		},

		injectServices: function(cb) {

		}
	}
};