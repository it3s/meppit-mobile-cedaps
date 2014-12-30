define(['angular'], function(angular) {

  'use strict';

  return ['$stateProvider', '$urlRouterProvider'
  , function($stateProvider, $urlRouterProvider) {
    $stateProvider

    // Define the App routes
    .state('app', {
      url: '/app'
    , abstract: true
    , templateUrl: 'js/core/templates/menu.html'
    , controller: 'AppCtrl'
    })

    .state('app.welcome', {
      url: '/welcome'
    , views: {
        'menuContent': {
          templateUrl: 'js/core/templates/welcome.html'
        }
      }
    })

    .state('app.home', {
      url: '/home'
    , views: {
        'menuContent': {
          templateUrl: 'js/core/templates/home.html'
        }
      }
    })

    .state('app.geodata_collection', {
      url: '/geo_data'
    , views: {
        'menuContent': {
          templateUrl: 'js/geodata/templates/geodata-collection.html'
        , controller: 'geodataCollectionCtrl'
        }
      }
    })

    .state('app.geodata', {
      url: '/geo_data/:geodataId'
    , views: {
        'menuContent': {
          templateUrl: 'js/geodata/templates/geodata.html'
        , controller: 'geodataCtrl'
        }
      },
      resolve: {
        geodata: ['$stateParams', 'geodataResource'
      , function($stateParams, geodataResource) {
          // Get object using 'resolve' instead of controller to be able to add
          // the object name in title.
          return geodataResource.as('geojson').get({
            geodataId: $stateParams.geodataId
          });
        }]
      }
    })

    .state('app.signup', {
      url: '/signup'
    , views: {
        'menuContent': {
          templateUrl: 'js/core/templates/signup.html'
        }
      }
    })

    .state('app.search', {
      url: '/search'
    , views: {
        'menuContent': {
          templateUrl: 'js/core/templates/search.html'
        }
      }
    })

    .state('app.favorites', {
      url: '/favorites'
    , views: {
        'menuContent': {
          templateUrl: 'js/favorites/templates/favorites.html'
        }
      }
    })

    .state('app.history', {
      url: '/history'
    , views: {
        'menuContent': {
          templateUrl: 'js/history/templates/history.html'
        }
      }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/welcome');
  }];

});
