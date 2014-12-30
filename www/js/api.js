define(['angular', 'config'], function(angular, config) {

  'use strict';

  var moduleName = 'app.api'
    , moduleDeps = [];

  angular.module(moduleName, moduleDeps)

  .factory('api', [function() {
    // Define the API info
    var apiDefaults = {
          protocol: 'https'
        , host: 'meppit.com'
        , port: ''
        , path: 'api'
        , version: 'v1'
        , endpoints: {
            geoData: {
              path: '/geo_data/:geoDataId'
            , params: { geoDataId: '@id' }
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
