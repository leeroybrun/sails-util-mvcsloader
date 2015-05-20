# sails-util-mvcsloader
Load the models, controllers, services, policies and config from your Sails hooks into the main app and extend it on your main sails server if you need

### USAGE
 Look the [example folder](https://github.com/jaumard/sails-util-mvcsloader/tree/master/example/sails-hook-echo) for files structure.
 
 Install it on your installable hook folder : 
 
```
npm install --save sails-util-mvcsloader
```
 
Then use it like this in your hook's index.js :
  

    module.exports = function(sails) {
        var loader = require("sails-util-mvcsloader")(sails);
        loader.configure(); // Load policies under ./api/policies and config under ./config
    
        /*
         OR if you want to set custom path :
         loader.configure({
             policies: __dirname + '/api/policies',// Path to your hook's policies
             config: __dirname + '/config'// Path to your hook's config
         });
         */
    
        return {
            initialize: function (next) {
                /*
                    Load models under ./api/models
                    Load controllers under ./api/controllers
                    Load services under ./api/services
                */
                loader.adapt(function (err) {
                    return next(err);
                });
    
                /*
                 OR if you want to set custom path for your files :
                 loader.adapt(function (err) {
                    return next(err);
                 },{
                     controllers: __dirname + '/controllers', // Path to your hook's controllers
                     models: __dirname + '/models', // Path to your hook's models
                     services: __dirname + '/services' // Path to your hook's services
                 });
                 */
            }
        };
    }


### USED BY 
[sails-hook-passport](https://github.com/jaumard/sails-hook-passport)

### TODO
- Add support for loading :
    - Views
    - Assets