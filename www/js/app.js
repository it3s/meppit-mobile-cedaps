'use strict'

angular.module('app', ['ionic'
                     , 'ngCordova'
                     , 'app.directives'
                     , 'app.controllers'])

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

  .config(['authenticationProvider', function(authenticationProvider) {
    // Configure `Client Id` and `Client Secret`
    authenticationProvider.config(
      'd652249289412e3a5233f04d817e8bdea11834772d116e7cd0ba1428f56a49e0',
      '241fd9be8d2971b51d82d85ec12431f75a1e25794c592ad37ff44a31b2cabd93'
    );
  }])

  .config(['$httpProvider', function($httpProvider) {
    // Set the default format we expect from http requests
    $httpProvider.defaults.headers.common['Accept'] = 'application/json';
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
