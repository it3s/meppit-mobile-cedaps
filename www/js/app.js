define(['angular'
      , 'ngIonic'
      , 'ngCordova'
      , 'controllers']
, function (angular, ngIonic, ngCordova, controllers) {

  'use strict';

  var moduleName = 'app'
    , moduleDeps = [ngIonic, ngCordova, controllers];

  angular.module(moduleName, moduleDeps)

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
  }])

  .config(['$stateProvider', '$urlRouterProvider'
, function($stateProvider, $urlRouterProvider) {
    $stateProvider

    // Define the App routes
    .state('app', {
      url: '/app'
    , abstract: true
    , templateUrl: 'templates/menu.html'
    , controller: 'AppCtrl'
    })

    .state('app.welcome', {
      url: '/welcome'
    , views: {
        'menuContent': {
          templateUrl: 'templates/welcome.html'
        }
      }
    })

    .state('app.home', {
      url: '/home'
    , views: {
        'menuContent': {
          templateUrl: 'templates/home.html'
        }
      }
    })

    .state('app.geodata_collection', {
      url: '/geo_data'
    , views: {
        'menuContent': {
          templateUrl: 'templates/geo-data-collection.html'
        , controller: 'GeoDataCollectionCtrl'
        }
      }
    })

    .state('app.geodata', {
      url: '/geo_data/:geoDataId'
    , views: {
        'menuContent': {
          templateUrl: 'templates/geo-data.html'
        , controller: 'GeoDataCtrl'
        }
      },
      resolve: {
        geoData: ['$stateParams', 'geoDataResource'
      , function($stateParams, geoDataResource) {
          // Get object using 'resolve' instead of controller to be able to add
          // the object name in title.
          return geoDataResource.as('geojson').get({
            geoDataId: $stateParams.geoDataId
          });
        }]
      }
    })

    .state('app.signup', {
      url: '/signup'
    , views: {
        'menuContent': {
          templateUrl: 'templates/signup.html'
        }
      }
    })

    .state('app.search', {
      url: '/search'
    , views: {
        'menuContent': {
          templateUrl: 'templates/search.html'
        }
      }
    })

    .state('app.favorites', {
      url: '/favorites'
    , views: {
        'menuContent': {
          templateUrl: 'templates/favorites.html'
        }
      }
    })

    .state('app.history', {
      url: '/history'
    , views: {
        'menuContent': {
          templateUrl: 'templates/history.html'
        }
      }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/welcome');
  }]);

  return moduleName;
});
