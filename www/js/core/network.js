app.core.network = (function(angular) {

  'use strict';

  var moduleName = 'app.core.network'
    , moduleDeps = [];

  angular.module(moduleName, moduleDeps)

  .factory('networkFactory', [function() {
    return function (networkInfo) {
      return angular.extend({}, networkInfo, {
        // Create the base URL using the `networkInfo` data.
        baseUrl: function() {
          // PROTOCOL and HOST are mandatory
          return this.protocol + '://'
               + this.host
               // PORT is optional
               + (this.port ? ':' + this.port : '') + '/'
               // PATH is optional
               + (this.path ? this.path + '/' : '')
               // VERSION is optional
               + (this.version ? this.version + '/' : '');
        }
      // Returns a string with the encoded `params` from an object.
      , encodeParams: function(params) {
        var encodedParams = [];
        if (angular.isString(params)) {
          // Already got an encoded params
          return params;
        }
        angular.forEach(params, function(value, key) {
          encodedParams.push(key + '=' + encodeURIComponent(value));
        });
        return encodedParams.join('&');
      }
      // Receives a string containing `path` and an object with `params` and
      // returns a full URL (using baseURL).
      , urlFor: function(path, params) {
          if(!angular.isDefined(path)) {
            path = '';
          }
          // Avoid `//` after baseURL
          if(path[0] == '/') {
            path = path.slice(1);
          }
          return this.baseUrl() + path
          + (angular.isDefined(params) ? '?' + this.encodeParams(params) : '');
        }
      });
    }
  }]);

  return moduleName;
})(angular);
