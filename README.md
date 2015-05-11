# sails-util-mcvsloader
Load the models, controllers, services from your Sails hooks into the main app

EXPERIMENTAL 

### USAGE
 Look the example folder.
 
 Add on your hook package.json the dependency : 
 
```
"sails-util-mcvsloader" : "~0.1.0"
```
 
 Then use it like this in your hook's index.js :
  
```
module.exports = function(sails) {
    return {    
      initialize: function(cb) {
        var hookLoader = require('sails-hook-hookloader')(sails);
        hookLoader.injectAll({
          controllers: __dirname+'/controllers', // Path to your hook's controllers
          models: __dirname+'/models', // Path to your hook's models
          services: __dirname+'/services' // Path to your hook's services
        }, function(err) {
          return cb();
        });
      }
    }
 }
```
### TODO

- Add support for loading :
    - Views
    - Assets