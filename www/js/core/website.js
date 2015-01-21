define(['angular', 'config', 'core/network']
, function(angular, config, network) {

  'use strict';

  var moduleName = 'app.core.website'
  , moduleDeps = [network];

  angular.module(moduleName, moduleDeps)
  .factory('website', ['$ionicPlatform', '$log', '$q', '$http'
  , 'networkFactory'
  , function ($ionicPlatform, $log, $q, $http, networkFactory) {
      return networkFactory(angular.extend({}, {}, config.website));
    }]);

    return moduleName;
  });
