app.routes = (function(angular) {

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
      url: '/geo_data/:id'
    , views: {
        'menuContent': {
          templateUrl: 'js/geodata/templates/geodata.html'
        , controller: 'geodataCtrl'
        }
      }
    , resolve: {
        geodata: ['$stateParams', 'geodataResource'
      , function($stateParams, geodataResource) {
          // Get object using 'resolve' instead of controller to be able to add
          // the object name in title.
          return geodataResource.as('geojson').get({
            geodataId: $stateParams.id
          });
        }]
      }
    })

    .state('app.geodata_comments', {
      url: '/geo_data/:parentId/comments'
      , views: {
        'menuContent': {
          templateUrl: 'js/comments/templates/comments.html'
        , controller: 'commentsCtrl'
        }
      }
      , resolve: {
          query: ['$stateParams', function($stateParams) {
            return {
              owner: 'GeoData#' + $stateParams.parentId
            };
          }]
        , baseUrl: ['$stateParams', function($stateParams) {
            return '/geo_data/' + $stateParams.parentId;
          }]
        , content: ['$stateParams', function($stateParams) {
            return {
              content_type: 'GeoData'
            , content_id: $stateParams.parentId
            };
          }]
      }
    })

    .state('app.geodata_comment', {
      url: '/geo_data/:parentId/comments/:id'
      , views: {
        'menuContent': {
          templateUrl: 'js/comments/templates/comment.html'
        , controller: 'commentCtrl'
        }
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

})(angular);
