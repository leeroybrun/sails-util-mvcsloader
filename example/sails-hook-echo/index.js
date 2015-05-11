/**
 * Created by jaumard on 28/03/2015.
 */

module.exports = function (sails)
{
	return {
		// Run when sails loads-- be sure and call `next()`.
		initialize : function (next)
		{
			var loader = require("sails-hook-hookloader")(sails);
			loader.injectAll({
				controllers : __dirname + '/controllers', // Path to your hook's controllers
				models      : __dirname + '/models', // Path to your hook's models
				services    : __dirname + '/services' // Path to your hook's services
			}, function (err)
			{
				return next(err);
			});
		}
	};
};
