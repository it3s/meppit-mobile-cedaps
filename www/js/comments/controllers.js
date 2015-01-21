define(['angular'
      , 'ngCordova'
      , 'vendor/scroll'
      , 'core/resources'
      , 'core/datasource'
      , 'core/directives']
, function(angular, ngCordova, scroll, resources, datasource, directives) {

  'use strict';

  var moduleName = 'app.comments.controllers'
    , moduleDeps = [ngCordova, scroll, resources, datasource, directives];

  angular.module(moduleName, moduleDeps)

  .controller('commentsCtrl', ['$scope'
                             , '$q'
                             , '$ionicLoading'
                             , 'datasource'
                             , 'commentsResource'
                             , 'query'
                             , 'baseUrl'
, function($scope, $q, $ionicLoading, datasource, commentsResource, query, baseUrl) {
    var resource = commentsResource.where(query);

    $scope.baseUrl = baseUrl;
    $ionicLoading.show();
    // `$scope.datasource` is an object used by `ui-scroll`
    $scope.datasource = datasource(resource, $ionicLoading.hide);
  }])

  .controller('commentCtrl', ['$scope', '$stateParams', 'commentsResource'
, function($scope, $stateParams, commentsResource) {
    var comment = commentsResource.get({
      commentId: $stateParams.commentId
    }).then(function(comment) {
      $scope.comment = comment;
    });
  }]);

  return moduleName;
});
