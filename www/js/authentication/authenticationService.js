define(['angular', './oauth', 'utils/localStorage']
, function(angular, oauth, localStorage) {

  'use strict';

  var moduleName = 'app.authentication.authenticationService'
    , moduleDeps = [oauth, localStorage];

  angular.module(moduleName, moduleDeps)

  .factory('authentication', ['$q', '$injector', 'OAuth', 'localStorage'
, function ($q, $injector, OAuth, storage) {
    var baseUrl = 'http://192.168.0.107'
      , accessTokenInfo
      , me
      , getCurrentUser;
    // Get saved access token
    accessTokenInfo = storage.getObject('authentication.accessTokenInfo');
    // Get saved user info
    getCurrentUser = function() {
      me = storage.getObject('authentication.me');
      if (angular.isDefined(me)) {
        me.avatar_url = baseUrl + me.avatar;
      }
    }
    getCurrentUser();
    console.log(angular.isDefined(me), angular.isDefined(accessTokenInfo));
    return {
      isAuthenticated: angular.isDefined(me) && angular.isDefined(accessTokenInfo)
    , currentUser: function() { return me; }
    , saveAccessToken: function(token) {
      this.isAuthenticated = true;
      // Save the access token
      accessTokenInfo = token;
      storage.setObject('authentication.accessTokenInfo', token);
      // Use injector to avoid circular dependency
      $injector.invoke(['usersResource', function(usersResource) {
        // Get user data and save locally
        me = usersResource.me().then(function(value) {
          me = value;
          if (angular.isDefined(value)) {
            value.avatar_url = baseUrl + value.avatar;
            storage.setObject('authentication.me', value);
          }
        });
      }]);
    }
    , authorize: function() {
        var deferred = $q.defer()
          , that = this;
        if (!angular.isDefined(accessTokenInfo)
         || !angular.isDefined(accessTokenInfo.refresh_token)) {
          return this.authenticate();
        }
        OAuth.meppit.refreshAccessToken(accessTokenInfo.refresh_token
        ).then(function(result) {
          that.saveAccessToken(result);
          deferred.resolve();
        }, function(error) {
          that.isAuthenticated = false;
          // Could not authorize, try to authenticate
          that.authenticate().then(function() {
            deferred.resolve();
          }, function(error) {
            deferred.reject(error);
          });
        });
        return deferred.promise;
      }
    , authenticate: function() {
        var deferred = $q.defer()
          , appScope = []
          , that = this;

        this.isAuthenticated = false;
        OAuth.meppit.authenticate(appScope).then(
          function(result) {
            that.saveAccessToken(result);
            deferred.resolve();
          }, function(error) {
            that.isAuthenticated = false;
            deferred.reject(error);
          });
        return deferred.promise;
      }
    , getAuthorizationHeader: function() {
      if (!angular.isDefined(accessTokenInfo)) { return ''; }
      return 'Bearer ' + accessTokenInfo.access_token;
    }
    };
  }]);

  return moduleName;
});
