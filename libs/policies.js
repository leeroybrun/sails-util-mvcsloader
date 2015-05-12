/**
 * Created by jaumard on 12/05/2015.
 */
var _          = require('lodash'), loadPolicies = require(__dirname + '/sails/_loadPolicies');
module.exports = function (sails, dir)
{
	//Adaptation needed for policies
	if (_.isArray(sails.config.paths.policies))
	{
		sails.config.paths.policies.push(dir);
	}
	else
	{
		sails.config.paths.policies = [sails.config.paths.policies, dir];
	}

	sails.modules.loadPolicies = loadPolicies;
	_.bind(sails.modules.loadPolicies, sails.modules);
};
