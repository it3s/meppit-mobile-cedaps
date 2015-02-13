app.comments = {};
app.comments.controllers = (function(angular) {

  'use strict';

  var moduleName = 'app.comments.controllers'
    , moduleDeps = ['ngCordova'
                  , 'app.core.ui.scroll'
                  , 'app.core.resources'
                  , 'app.core.datasource'
                  , 'app.core.directives'];

  angular.module(moduleName, moduleDeps)

  .controller('commentsCtrl', ['$scope'
                             , '$q'
                             , '$ionicLoading'
                             , 'datasource'
                             , 'commentsResource'
, function($scope, $q, $ionicLoading, datasource, commentsResource) {

    var query = {
      owner: $scope.objectType + '#' + $scope.objectId
    }
  , content = {
      content_type: $scope.objectType
    , content_id: $scope.objectId
    }
  , resource = commentsResource.where(query);

    $ionicLoading.show();
    // `$scope.datasource` is an object used by `ui-scroll`
    $scope.datasource = datasource(resource, $ionicLoading.hide);
    $scope.newComment = angular.extend({}, { comment: '' }, content);
    $scope.saveNewComment = function() {
          // Save the current comment
          commentsResource.save($scope.newComment).then(function(comment) {
            // TODO: Display the new comment
          });
          // Create a new blank comment object to be possible to write more comments
          $scope.newComment = angular.extend({}, { comment: '' }, content);
        };
  }])

  .controller('commentCtrl', ['$scope', '$stateParams', 'commentsResource'
, function($scope, $stateParams, commentsResource) {
    var comment = commentsResource.get({
      commentId: $stateParams.id
    }).then(function(comment) {
      $scope.comment = comment;
    });
  }]);

  return moduleName;
})(angular);
