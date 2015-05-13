var async = require('async');
var util  = require('sails-util');

module.exports = function (sails)
{

	return {

		defaults : {},

		injectPolicies : function (dir)
		{
			require(__dirname + "/libs/policies")(sails, dir);
			/*
			 async.waterfall([// Load controllers from the given directory
			 function loadPoliciesFromDirectory(next)
			 {
			 buildDictionary.optional({
			 dirname            : dir,
			 filter             : /^([^.]+)\.(js|coffee|litcoffee)$/,
			 flattenDirectories : true,
			 keepDirectoryPath  : true,
			 replaceExpr        : /Controller/
			 }, next);
			 }, // Register policies on the main "policies" hook
			 function registerPolicies(modules, next)
			 {
			 // Extends sails.policies with new ones
			 //sails.config.policies = _.merge(modules || {}, sails.config.policies || {});
			 var policies = require(dir + "/config.json");

			 _.each(modules, function (policy, policyId)
			 {
			 sails.hooks.policies.middleware[policyId] = policy;
			 });
			 _.each(policies, function (policy, policyId)
			 {
			 policyId = util.normalizeControllerId(policyId);
			 _.each(policy, function (action, actionID)
			 {
			 sails.hooks.policies.mapping[policyId] = {};
			 if (util.isArray(action))
			 {
			 var actions = [];
			 for (var i = 0; i < action.length; i++)
			 {
			 var act = action[i].toLowerCase();
			 actions.push(sails.hooks.policies.middleware[act]);
			 }
			 sails.hooks.policies.mapping[policyId][actionID] = actions;
			 }
			 else
			 {
			 sails.hooks.policies.mapping[policyId][actionID] = [sails.hooks.policies.middleware[action.toLowerCase()]];
			 }

			 });

			 });
			 next();
			 }], function (err)
			 {
			 cb(err);
			 });
			 */
		},
		injectConfig : function (dir)
		{
			require(__dirname + "/libs/config")(sails, dir);
		},

		injectControllers : function (dir, cb)
		{
			require(__dirname + "/libs/controllers")(sails, dir, cb);

		},

		injectModels : function (dir, cb)
		{
			require(__dirname + "/libs/models")(sails, dir, cb);
		},

		injectServices : function (dir, cb)
		{
			require(__dirname + "/libs/services")(sails, dir, cb);
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
			if (dir.policies)
			{
				self.injectPolicies(dir.policies);
				sails.log.info('User hook policies loaded from ' + dir.policies + '.');
			}
			if (dir.config)
			{
				self.injectConfig(dir.config);
				sails.log.info('User hook config loaded from ' + dir.config + '.');
			}

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
					if (err)
					{
						sails.log.error(err);
					}
					if (cb)
					{
						cb(err);
					}
				});
			});
		}
	}
};
