app.core.localStorage = (function(angular) {

  'use strict';

  var moduleName = 'app.core.localStorage'
    , moduleDeps = [];

  angular.module(moduleName, moduleDeps)

  .factory('storage', ['$window', '$q', function($window, $q) {
    return {
      set: function(key, value) {
        $q.when(value).then(function(value) {
          if (angular.isDefined(value)) {
            $window.localStorage[key] = value;
          }
        });
      }
    , get: function(key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      }
    , delete: function(key) {
        $window.localStorage.removeItem(key);
      }
    , setObject: function(key, value) {
        $q.when(value).then(function(value) {
          if (angular.isDefined(value)) {
            $window.localStorage[key] = angular.toJson(value);
          }
        });
      }
    , getObject: function(key) {
        var value = $window.localStorage[key];
        return angular.isDefined(value) ? angular.fromJson(value) : undefined;
      }
    , deleteObject: function(key) {
        $window.localStorage.removeItem(key);
      }
    };
  }]);

  return moduleName;
})(angular);
