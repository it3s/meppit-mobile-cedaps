define(['angular'
      , 'ngCordova'
      , 'vendor/scroll'
      , 'core/resources'
      , 'core/authentication'
      , 'core/datasource'
      , 'core/directives']
, function(angular, ngCordova, scroll, resources, authentication, datasource, map) {

  'use strict';

  var moduleName = 'app.geodata.controllers'
    , moduleDeps = [ngCordova, scroll, authentication, resources, datasource, map];

  angular.module(moduleName, moduleDeps)

  .controller('AppCtrl', ['$scope', 'authentication'
, function($scope, authentication) {
    // Don't pass the `authenticate` reference directly because it is bind to
    // a wrong object
    $scope.login = function() { return authentication.authenticate(); };
    $scope.me = authentication.currentUser();
    $scope.isAuthenticated = authentication.isAuthenticated;
  }])

  .controller('geodataCollectionCtrl', ['$scope'
                                      , '$q'
                                      , '$cordovaGeolocation'
                                      , '$ionicLoading'
                                      , 'datasource'
                                      , 'geodataResource'
, function($scope, $q, $cordovaGeolocation, $ionicLoading
         , datasource, geodataResource) {
    var posOptions = { timeout: 10000, enableHighAccuracy: false }
      , lonLat = $q.defer()
      , resource = geodataResource.sortBy('location').where(lonLat.promise);

    $ionicLoading.show();
    // `$scope.datasource` is an object used by `ui-scroll`
    $scope.datasource = datasource(resource, $ionicLoading.hide);

    $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
      // Got the async response with user geolocation
      lonLat.resolve({
        longitude: position.coords.longitude
      , latitude: position.coords.latitude
      });
    }, function() {
      // Could not get user location, let's sort by name instead
      resource.sortBy('name');
      lonLat.resolve({});
    });

  }])

  .controller('geodataCtrl', ['$scope', '$stateParams', 'geodata'
, function($scope, $stateParams, geodata) {
    // The `geoData` value is set by state provider resolver
    $scope.geodata = geodata;
  }]);

  return moduleName;
});
