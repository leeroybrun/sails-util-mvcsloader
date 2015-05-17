# sails-util-mvcsloader
Load the models, controllers, services, policies and config from your Sails hooks into the main app and extend it on your main sails server if you need

### USAGE
 Look the example folder.
 
 Install it on your installable hook folder : 
 
```
npm install --save sails-util-mvcsloader
```
 
 Then use it like this in your hook's index.js :
  
```
module.exports = function(sails) {
    var hookLoader = require('sails-util-mvcsloader')(sails);
    hookLoader.injectAll({
    		policies : __dirname + '/policies',// Path to your hook's policies
    		config   : __dirname + '/config'// Path to your hook's config
    	});
    return {    
      initialize: function(cb) {
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

### USED BY 
[sails-hook-passport](https://github.com/jaumard/sails-hook-passport)

### TROUBLES 
If you use multiple hooks how use this module you will have this error : 

    error: Failed to reinitialize ORM.
    error: AdapterError: Connection is already registered

To fix this just create a config/mvcsloarder.js with : 

    module.exports.mvcsloader = {
        reloadORM : false
    };

And add this on your config/bootstrap.js

    sails.hooks.orm.reload();

### TODO
- Add support for loading :
    - Views
    - Assets