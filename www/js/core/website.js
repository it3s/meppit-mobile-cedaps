app.core.website = (function(angular) {

  'use strict';

  var moduleName = 'app.core.website'
  , moduleDeps = ['app.core.network'];

  angular.module(moduleName, moduleDeps)
  .factory('website', ['$ionicPlatform', '$log', '$q', '$http'
  , 'networkFactory'
  , function ($ionicPlatform, $log, $q, $http, networkFactory) {
      // You can edit `config.js` to change website info.
      return networkFactory(angular.extend({}, {}, app.config.website));
  }]);

  return moduleName;
})(angular);
