app.geodata = {};
app.geodata.controllers = (
function(angular) {

  'use strict';

  var moduleName = 'app.geodata.controllers'
    , moduleDeps = ['ngCordova'
                  , 'app.core.ui.scroll'
                  , 'app.core.resources'
                  , 'app.core.authentication'
                  , 'app.core.datasource'
                  , 'app.core.directives'];

  angular.module(moduleName, moduleDeps)

  .controller('AppCtrl', ['$scope', '$state', '$ionicHistory', 'authentication'
, function($scope, $state, $ionicHistory, authentication) {
    // Don't pass the `authenticate` reference directly because it is bind to
    // a wrong object
    $scope.login = function() {
      authentication.authenticate().then(function() {
        $state.go('app.home')
      });
    };
    $scope.logout = function() {
      authentication.forget();
      $state.go('app.welcome').then(function() {
        // TODO: test me
        $ionicHistory.clearCache();
      });
    };
    $scope.authInfo = authentication.info;
  }])

  .controller('geodataCollectionCtrl', ['$scope'
                                      , '$q'
                                      , '$cordovaGeolocation'
                                      , '$ionicLoading'
                                      , '$state'
                                      , 'datasource'
                                      , 'geodataResource'
, function($scope, $q, $cordovaGeolocation, $ionicLoading, $state
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

  .controller('geodataCtrl', ['$scope', '$state', 'geodata'
, function($scope, $state, geodata) {
    // The `geoData` value is set by state provider resolver
    $scope.object = geodata;
    $scope.objectId = geodata.id;
    $scope.objectType = 'GeoData'
    $scope.baseUrl = '/geo_data/' + geodata.id;
  }]);

  return moduleName;
})(angular);
