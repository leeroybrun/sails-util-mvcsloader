var async = require('async');
var _     = require('lodash');
var buildDictionary = require('sails-build-dictionary');

module.exports = function (sails)
{

	var _bindToSails = function (modules, cb)
	{
		_.each(modules, function (module)
		{
			// Add a reference to the Sails app that loaded the module
			module.sails = sails;
			// Bind all methods to the module context
			_.bindAll(module);
		});

		return cb(null, modules);
	};

	return {

		defaults : {},

		injectControllers : function (dir, cb)
		{

			async.waterfall([// Load controllers from the given directory
				function loadModulesFromDirectory(next)
				{
					buildDictionary.optional({
						dirname            : dir,
						filter             : /(.+)Controller\.(js|coffee|litcoffee)$/,
						flattenDirectories : true,
						keepDirectoryPath  : true,
						replaceExpr        : /Controller/
					}, next);
				},

				// Bind all controllers methods to sails
				function bindControllersToSails(modules, next)
				{
					_bindToSails(modules, next);
				},

				// Register controllers on the main "controllers" hook
				function registerControllers(modules, next)
				{
					// Extends sails.controllers with new ones
					sails.controllers = _.merge(modules || {}, sails.controllers || {});

					// Loop through each controllers and register them
					_.each(modules, function (controller, controllerId)
					{
						// If controller does not exists yet, create empty object
						sails.hooks.controllers.middleware[controllerId] = sails.hooks.controllers.middleware[controllerId] || {};

						// Register this controller's actions
						_.each(controller, function (action, actionId)
						{
							// actionid is always lowercase
							actionId = actionId.toLowerCase();

							// If the action is set to `false`, explicitly disable (remove) it
							if (action === false)
							{
								delete sails.hooks.controllers.middleware[controllerId][actionId];
								return;
							}

							// Do not register string or boolean actions
							if (_.isString(action) || _.isBoolean(action))
							{
								return;
							}

							// Register controller's action on the main "controllers" hook
							action._middlewareType                                          = 'ACTION: ' + controllerId + '/' + actionId;
							sails.hooks.controllers.middleware[controllerId][actionId]      = action;
							sails.hooks.controllers.explicitActions[controllerId]           = sails.hooks.controllers.explicitActions[controllerId] || {};
							sails.hooks.controllers.explicitActions[controllerId][actionId] = true;
						});
					});

					return next();
				}], function (err)
			{
				cb(err);
			});
		},

		injectModels : function (dir, cb)
		{
			async.waterfall([function loadModelsFromDirectory(next)
			{
				buildDictionary.optional({
					dirname            : dir,
					filter             : /^([^.]+)\.(js|coffee|litcoffee)$/,
					replaceExpr        : /^.*\//,
					flattenDirectories : true
				}, next);
			},

				function loadAttributesFromDirectory(models, next)
				{
					// Get any supplemental files
					buildDictionary.optional({
						dirname            : dir,
						filter             : /(.+)\.attributes.json$/,
						replaceExpr        : /^.*\//,
						flattenDirectories : true
					}, function (err, supplements)
					{
						if (err)
						{
							return cb(err);
						}
						return next(null, models, supplements);
					});
				},

				function bindSupplementsToSails(models, supplements, next)
				{
					_bindToSails(supplements, function (err, supplements)
					{
						if (err)
						{
							return cb(err);
						}
						return next(null, _.merge(models, supplements));
					});
				},

				function injectModelsIntoSails(modules, next)
				{
					sails.models = _.merge(modules || {}, sails.models || {});

					return next(null);
				},

				function reloadSailsORM(next)
				{
					sails.hooks.orm.reload();

					return next();
				}], function (err)
			{
				return cb(err);
			});
		},

		injectServices : function (dir, cb)
		{
			async.waterfall([function loadServicesFromDirectory(next)
			{
				buildDictionary.optional({
					dirname            : dir,
					filter             : /^([^.]+)\.(js|coffee|litcoffee)$/,
					replaceExpr        : /^.*\//,
					flattenDirectories : true
				}, next);
			},

				// Bind all controllers methods to sails
				function bindServicesToSails(modules, next)
				{
					_bindToSails(modules, next);
				},

				function injectServicesIntoSails(modules, next)
				{
					sails.services = _.merge(modules || {}, sails.services || {});
					if (sails.config.globals.services)
					{
						_.each(modules, function (service, serviceId)
						{
							global[service.globalId] = service;
						});
					}
					return next(null);
				}], function (err)
			{
				return cb(err);
			});
		},

		injectAll : function (dir, cb)
		{
			var self = this;

			var loadModels = function (next)
			{
				self.injectModels(dir.models, function (err)
				{
					if (err)
					{
						return next(err);
					}
					sails.log.info('User hook models loaded from ' + dir.models + '.');
					return next(null);
				});
			};

			var loadControllers = function (next)
			{
				self.injectControllers(dir.controllers, function (err)
				{
					if (err)
					{
						return next(err);
					}

					sails.log.info('User hook controllers loaded from ' + dir.models + '.');

					return next(null);
				});
			};
			var loadServices    = function (next)
			{
				self.injectServices(dir.services, function (err)
				{
					if (err)
					{
						return next(err);
					}
					sails.log.info('User hook services loaded from ' + dir.services + '.');
					return next(null);
				});
			};

			sails.on('hook:orm:loaded', function ()
			{
				var toLoad = [];
				if (dir.models)
				{
					toLoad.push(loadModels);
				}
				if (dir.controllers)
				{
					toLoad.push(loadControllers);
				}

				if (dir.services)
				{
					toLoad.push(loadServices);
				}

				async.waterfall(toLoad, function (err)
				{
					sails.log.error(err);
					return cb(err);
				});
			});
		}
	}
};
