define(['angular', 'config'], function(angular, config) {

  'use strict';

  var moduleName = 'app.core.api'
    , moduleDeps = [];

  angular.module(moduleName, moduleDeps)

  .factory('api', [function() {
    // Define the API info
    var apiDefaults = {
          // You can edit `config.js` to use a custom host
          protocol: 'https'
        , host: 'meppit.com'
        , port: ''
        , path: 'api'
        , version: 'v1'
        , resources: {
            // Format:
            // 'resourceName': {
            //   path: '/path/:resourceId'
            // , params: {
            //     resourceId: '@id'
            //   , other: 'param'
            //   }
            // , actions: {
            //     'actionName' : { url: '/path', method: 'HTTP_METHOD'}
            //   }
            // , options: { stripTrailingSlashes: true }
            // }
            //
            // `actions` and `options` are optionals.
            //
            // Will be automatically created at `core/resources` module a
            // factory named `resourceNameResource` for each item.
            geodata: {
              path: '/geo_data/:geodataId'
            , params: { geodataId: '@id' }
            }
          , users: {
              path: '/users/:userId'
            , params: { userId: '@id' }
            , actions: {
                me: { url: '/me', method: 'GET' }
              }
            }
          }
        };

    return angular.extend({}, apiDefaults, config.api);
  }]);

  return moduleName;
});