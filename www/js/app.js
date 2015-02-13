app.main = (function (angular) {

  'use strict';

  var moduleName = 'app'
    , moduleDeps = ['ionic'
                  , 'ngCordova'
                  , 'app.core.resources'
                  , 'app.geodata.controllers'
                  , 'app.comments.controllers'];

  angular.module(moduleName, moduleDeps)

  .config(['$httpProvider', function($httpProvider) {
    // Force the post Content-Type because for some reason its not working
    // correctly using the default value.
    $httpProvider.defaults.headers.post = {'Content-Type': 'application/json'};
  }])

  .config(app.routes)

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
})(angular);
