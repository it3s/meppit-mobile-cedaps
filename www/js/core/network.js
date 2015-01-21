define(['angular'], function(angular) {

  'use strict';

  var moduleName = 'app.core.network'
    , moduleDeps = [];

  angular.module(moduleName, moduleDeps)

  .factory('networkFactory', [function() {
    return function (networkInfo) {
      return angular.extend({}, networkInfo, {
        baseUrl: function() {
          return this.protocol + '://'
               + this.host
               + (this.port ? ':' + this.port : '') + '/'
               + (this.path ? this.path + '/' : '')
               + (this.version ? this.version + '/' : '');
        }
      , encodeParams: function(params) {
        var encodedParams = [];
        if (angular.isString(params)) {
          return params;
        }
        angular.forEach(params, function(value, key) {
          encodedParams.push(key + '=' + encodeURIComponent(value));
        });
        return encodedParams.join('&');
      }
      , urlFor: function(path, params) {
          if(!angular.isDefined(path)) {
            path = '';
          }
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
});
