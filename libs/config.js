/**
 * Created by jaumard on 12/05/2015.
 */
var buildDictionary = require('sails-build-dictionary');
module.exports      = function (sails, dir, cb)
{
	buildDictionary.aggregate({
		dirname     : dir,
		exclude     : ['locales', 'local.js', 'local.json', 'local.coffee', 'local.litcoffee'],
		excludeDirs : /(locales|env)$/,
		filter      : /(.+)\.(js|json|coffee|litcoffee)$/,
		identity    : false
	}, function (err, configs)
	{
		if (err)
		{
			return cb(err);
		}

		sails.config = sails.util.merge(configs, sails.config);

		cb();
	});
};
