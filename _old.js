/**
 * Plugin loader
 */

var _ = require('lodash');
var async = require('async');
var waterline = require('waterline');
var includeAll = require('include-all');

// taken from sails/lib/hooks/orm/loadUserModules
function _lookupUserModules (sails) {

  return function lookupUserModules (cb) {

    sails.log.verbose('Loading the app\'s models and adapters...');
    async.auto({

      models: function(cb) {
        sails.log.verbose('Loading app models...');

        // sails.models = {};

        // Load app's model definitions
        // Case-insensitive, using filename to determine identity
        sails.modules.loadModels(function modulesLoaded(err, modules) {
          if (err) return cb(err);
          sails.models = _.extend(sails.models || {}, modules);
          return cb();
        });
      },

      adapters: function(cb) {
        sails.log.verbose('Loading app adapters...');

        // sails.adapters = {};

        // Load custom adapters
        // Case-insensitive, using filename to determine identity
        sails.modules.loadAdapters(function modulesLoaded(err, modules) {
          if (err) return cb(err);
          sails.adapters = _.extend(sails.adapters || {}, modules);
          return cb();
        });
      }

    }, cb);
  };
};

function injectPlugin(dir, cb) {
  var models = includeAll({
    dirname     :  dir + '/models',
    filter      :  /(.+)\.js$/,
    excludeDirs :  /^\.(git|svn)$/
  });

  var controllers = includeAll({
    dirname     :  dir + '/controllers',
    filter      :  /(.+)Controller\.js$/,
    excludeDirs :  /^\.(git|svn)$/
  });

  injectPluginModels(models, function(err) {
    mountBlueprintsForModels(models);

  });

  for(var controllerName in controllers) {
    controllerName = controllerName.replace(/Controller$/, '');
    
  }
};

// http://stackoverflow.com/a/21679393/1160800
function injectPluginModels(pluginModels, cb) {
  // copy sails/lib/hooks/orm/loadUserModules to make it accessible here
  var loadUserModelsAndAdapters = _lookupUserModules(sails);

  async.auto({
    // 1. load api/models, api/adapters
    _loadModules: loadUserModelsAndAdapters,

    // 2. Merge additional models,  3. normalize model definitions
    modelDefs: ['_loadModules', function(next){
      _.each(additionModels, function(aditionModel) {
         _.merge(sails.models, additionalModel);
      });

      _.each(sails.models, sails.hooks.orm.normalizeModelDef);
      next(null, sails.models);
    }],

    // 4. Load models into waterline, 5. tear down connections, 6. reinitialize waterline
    instantiatedCollections: ['modelDefs', function(next, stack){
      var modelDefs = stack.modelDefs;

      var waterline = new Waterline();
      _.each(modelDefs, function(modelDef, modelID){
        waterline.loadCollection(Waterline.Collection.extend(modelDef));
      });

      var connections = {};

      _.each(sails.adapters, function(adapter, adapterKey) {
        _.each(sails.config.connections, function(connection, connectionKey) {
          if (adapterKey !== connection.adapter) return;
          connections[connectionKey] = connection;
        });
      });

      var toTearDown = [];

      _.each(connections, function(connection, connectionKey) {
        toTearDown.push({ adapter: connection.adapter, connection: connectionKey });
      });

      async.each(toTearDown, function(tear, callback) {
         sails.adapters[tear.adapter].teardown(tear.connection, callback);
      }, function(){
         waterline.initialize({
           adapters: sails.adapters,
           connections: connections
         }, next)
      });
    }],

    // 7. Expose initialized models to global scope and sails
    _prepareModels: ['instantiatedCollections', sails.hooks.orm.prepareModels]

  }, cb);
};

function mountBlueprintsForModels(pluginModels) {
  _.each(pluginModels, function(pluginModel){
    var controller = _.cloneDeep(pluginModel);
    controller._config = { rest: true };

    var controllerId = pluginModel.identity;

    if (!_.isObject(sails.controllers[controllerId])) {
      sails.controllers[controllerId] = controller;
    }

    if (!_.isObject(sails.hooks.controllers.middleware[controllerId])) {
      sails.hooks.controllers.middleware[controllerId] = controller;
    }
  });
};

module.exports = {
  loadModels: loadPluginModels,
  injectModels: injectPluginModels,
  mountBlueprintsForModels: mountBlueprintsForModels
}