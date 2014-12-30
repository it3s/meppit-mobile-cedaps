define(['angular'], function(angular) {

  'use strict';

  var moduleName = 'app.utils.localStorage'
    , moduleDeps = [];

  angular.module(moduleName, moduleDeps)

  .factory('localStorage', ['$window', '$q', function($window, $q) {
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
    };
  }]);

  return moduleName;
});
