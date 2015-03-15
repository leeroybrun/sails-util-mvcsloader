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

	return {

		defaults: {},

		initialize: function(cb) {
			return cb();
		},

		explicitActions: {},

		injectControllers: function(dir, cb) {
			var self = this;

			console.log('self', self);

			async.waterfall([
				function loadModulesFromDirectory(next) {
					buildDictionary.optional({
				        dirname: dir,
				        filter: /(.+)Controller\.(js|coffee|litcoffee)$/,
				        flattenDirectories: true,
				        keepDirectoryPath: true,
				        replaceExpr: /Controller/
				    }, next);
				},

				function bindControllersToSails(modules, next) {
					_bindToSails(modules, next);
				},

				function registerControllers(modules, next) {
					sails.controllers = _.extend(sails.controllers || {}, modules);

					_.each(sails.controllers, function(controller, controllerId) {
						self.middleware[controllerId] = self.middleware[controllerId] || {};

						// Register this controller's actions
						_.each(controller, function(action, actionId) {
							actionId = actionId.toLowerCase();

							// If the action is set to `false`, explicitly disable it
							if (action === false) {
								delete self.middleware[controllerId][actionId];
								return;
							}

							if (_.isString(action) || _.isBoolean(action)) {
								return;
							}

							action._middlewareType = 'ACTION: '+controllerId+'/'+actionId;
							self.middleware[controllerId][actionId] = action;
				            self.explicitActions[controllerId] = self.explicitActions[controllerId] || {};
				            self.explicitActions[controllerId][actionId] = true;
				        });
					});

					return next();
				}
			], function(err) {
				cb(err);
			});
		},

		injectModels: function(cb) {

		},

		injectServices: function(cb) {

		}
	}
};