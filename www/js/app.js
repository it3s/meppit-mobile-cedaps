define(['angular'
      , 'routes'
      , 'ngIonic'
      , 'ngCordova'
      , 'core/resources'
      , 'geodata/controllers'
      , 'comments/controllers']
, function (angular, routes, ngIonic, ngCordova, resources, geoDataCtrls, commentsCtrls) {

  'use strict';

  var moduleName = 'app'
    , moduleDeps = [ngIonic, ngCordova, resources, geoDataCtrls, commentsCtrls];

  angular.module(moduleName, moduleDeps)

  .config(['$httpProvider', function($httpProvider) {
    // Force the post Content-Type because for some reason its not working
    // correctly using the default value.
    $httpProvider.defaults.headers.post = {'Content-Type': 'application/json'};
  }])

  .config(routes)

  .run(['$ionicPlatform', function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory
      // bar above the keyboard for form inputs)
      if(window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  }]);

  return moduleName;
});
