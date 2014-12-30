define(['angular'
      , 'ngCordova'
      , 'vendor/scroll'
      , 'resources'
      , 'authentication/authenticationService'
      , 'utils/datasource'
      , 'map/directives']
, function(angular, ngCordova, scroll, resources, authentication, datasource, map) {

  'use strict';

  var moduleName = 'app.geoData.controllers'
    , moduleDeps = [ngCordova, scroll, authentication, resources, datasource, map];

  angular.module(moduleName, moduleDeps)

  .controller('AppCtrl', ['$scope', 'authentication'
, function($scope, authentication) {
    // Don't pass the `authenticate` reference directly because it is bind to
    // wrong object
    $scope.login = function() { return authentication.authenticate(); };
    $scope.me = authentication.currentUser();
    $scope.isAuthenticated = authentication.isAuthenticated;
  }])

  .controller('GeoDataCollectionCtrl', ['$scope'
                                      , '$q'
                                      , '$cordovaGeolocation'
                                      , '$ionicLoading'
                                      , 'datasource'
                                      , 'geoDataResource'
, function($scope, $q, $cordovaGeolocation, $ionicLoading
         , datasource, geoDataResource) {
    var posOptions = { timeout: 10000, enableHighAccuracy: false }
      , lonLat = $q.defer()
      , resource = geoDataResource.sortBy('location').where(lonLat.promise);

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

  .controller('GeoDataCtrl', ['$scope', '$stateParams', 'geoData'
, function($scope, $stateParams, geoData) {
    // The `geoData` value is set by state provider resolver
    $scope.geoData = geoData;
  }]);

  return moduleName;
});
