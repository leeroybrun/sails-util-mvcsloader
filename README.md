# sails-util-mcvsloader
Load the models, controllers, services, policies and config from your Sails hooks into the main app 

### USAGE
 Look the example folder.
 
 Install it on your installable hook folder : 
 
```
npm install --save sails-util-mvcsloader
```
 
 Then use it like this in your hook's index.js :
  
```
module.exports = function(sails) {
    var hookLoader = require('sails-hook-hookloader')(sails);
    hookLoader.injectAll({
    		policies : __dirname + '/policies',// Path to your hook's policies
    		config   : __dirname + '/config'// Path to your hook's config
    	});
    return {    
      initialize: function(cb) {
        hookLoader.injectAll({
          controllers: __dirname+'/controllers', // Path to your hook's controllers
          models: __dirname+'/models', // Path to your hook's models
          services: __dirname+'/services', // Path to your hook's services
          config: __dirname+'/config' // Path to your hook's config
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