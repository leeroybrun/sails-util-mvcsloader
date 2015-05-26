# sails-util-mvcsloader

[![NPM](https://nodei.co/npm/sails-util-mvcsloader.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/sails-util-mvcsloader/)

Load models, controllers, services, policies and config from specified directories and inject them into the main Sails app.

This is partically usefull to extend your Sails app from hooks.

You can have create new models/controllers/etc in your hook, and have them loaded into the main Sails app.  
You can even extend models/controllers/etc already existing in your main Sails app with specific methods/properties from your hooks.

## Installation

You have to install it in the project from where you will load the models/controllers/etc.

If you want to load MVCS from a hook in your main Sails' app (living in the hooks/ folder), install it in your Sails app's main folder.

If you want to load MVCS from an installable hook (separate NPM package), install it directly in your installable hook's main folder.

Run this command to install and add the package as a dependency in your package.json :

```
npm install --save sails-util-mvcsloader
```

## How to use it

You can find a complete hook example in the [example folder](https://github.com/jaumard/sails-util-mvcsloader/tree/master/example/sails-hook-echo).

Using this module is pretty easy.

In your hook's index.js file, require the module and pass your Sails app as first argument :

    module.exports = function(sails) {
        var loader = require('sails-util-mvcsloader')(sails);

        ...

        return {
            initialize: function (next) {
                ...
            }
        };
    };


### Loading config / policies

You can load config and policies with the `configure` method.  
This method is synchronous and MUST be called before the hook initialisation, outside the initialize method.  
If you don't want/need to load config or policies, you don't have to call this method.

Use it like this (complete example below):

    // Load policies under ./api/policies and config under ./config
    loader.configure();

Or like this if you want to load from specific directories:

    loader.configure({
        policies: __dirname + '/api/policies',// Path to the policies to load
        config: __dirname + '/config' // Path to the config to load
    });


### Loading models / controllers / services

To load models, controllers and services, call the `inject` method.  
This method is asynchronous and must be called after the `configure` method (presented above), if you need to load config and policies.

Use it like this (complete example below):

    /*
        Load models under ./api/models
        Load controllers under ./api/controllers
        Load services under ./api/services
    */
    loader.inject(function (err) {
        return next(err);
    });

Or like this if you want to load from specific directories:

    loader.adapt({
        controllers: __dirname + '/controllers', // Path to the controllers to load
        models: __dirname + '/models', // Path to the models to load
        services: __dirname + '/services' // Path to the services to load
    }, function (err) {
        return next(err);
    });
 

### Complete example

Here is a complete example. It's the index.js file of a Sails hook.

    module.exports = function(sails) {
        var loader = require('sails-util-mvcsloader')(sails);

        // Load policies under ./api/policies and config under ./config
        loader.configure();
    
        /*
            OR if you want to set a custom path :

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
                loader.inject(function (err) {
                    return next(err);
                });
    
                /*
                    OR if you want to set a custom path :

                    loader.inject({
                        controllers: __dirname + '/controllers', // Path to your hook's controllers
                        models: __dirname + '/models', // Path to your hook's models
                        services: __dirname + '/services' // Path to your hook's services
                    }, function (err) {
                        return next(err);
                    });
                 */
            }
        };
    }


## Used by
[sails-hook-passport](https://github.com/jaumard/sails-hook-passport)

## Development

### Contributing

For now, we use 4 spaces instead of 2.  
For the rest, please follow the [Felix's Node.js Style Guide](https://github.com/felixge/node-style-guide).

We use [semantic versioning](https://docs.npmjs.com/getting-started/semantic-versioning) for the NPM package.

### Contributors

- [Leeroy Brun](https://github.com/leeroybrun)
- [Jimmy Aumard](https://github.com/jaumard)

### TODO
- Add support for loading :
    - Views
    - Assets
- Add tests
- Add Grunt for auto-JSHint & tests