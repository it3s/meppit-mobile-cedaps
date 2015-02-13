app.core.authentication = (function(angular) {

  'use strict';

  var moduleName = 'app.core.authentication'
    , moduleDeps = ['app.core.oauth'
                  , 'app.core.website'
                  , 'app.core.localStorage'];

  angular.module(moduleName, moduleDeps)

  .factory('authentication'
, ['$q', '$log', '$injector', '$rootScope', 'OAuth', 'website', 'storage'
, function ($q, $log, $injector, $rootScope, OAuth, website, storage) {
    var info = {
          isAuthenticated: false
        , isAuthorized:    false
        , accessTokenInfo: undefined
        , me: undefined
        , authenticated_at: undefined
        };

    // Get updated user data from server
    function updateMe() {
      var deferred = $q.defer();
      // Use injector because we get circular dependency if ask for this when
      // module id defined
      $injector.invoke(['usersResource', function(usersResource) {
        usersResource.me().then(function(me) {
          info.me = me;
          if (angular.isDefined(me)) {
            me.avatar_url = website.urlFor(me.avatar);
            storage.setObject('authentication.me', me);
          }
          deferred.resolve(me);
        }, function() { deferred.reject(); });
      }]);
      return deferred.promise;
    }

    // Check if the access token already expired
    function isAccessTokenExpired() {
      if (!angular.isDefined(info.accessTokenInfo)) {
        return false;
      }
      return info.accessTokenInfo.expires_at <= (new Date()).getTime();
    }

    // Save the access token info locally
    function saveAccessToken(tokenInfo) {
      $log.debug('Saving access token: ', tokenInfo);
      // Set the date when access token will expire in miliseconds
      tokenInfo.expires_at = (new Date()).getTime()
                             + (tokenInfo.expires_in * 1000);
      // Save the access token
      info.accessTokenInfo = tokenInfo;
      storage.setObject('authentication.accessTokenInfo', tokenInfo);
      // We got an access token so we are authenticated and authorized
      info.isAuthenticated = true;
      info.isAuthorized = true;
      // Get user updated data from server and notify about changes
      updateMe();
      $log.debug(info);
    }

    // Request new access token
    function refreshAccessToken() {
      $log.debug('Requesting new access token...');
      var requestPromise = OAuth.meppit.refreshAccessToken(
        info.accessTokenInfo.refresh_token)
      requestPromise.then(function(tokenInfo) { saveAccessToken(tokenInfo); });
      return requestPromise;
    }

    // Load saved values
    function loadLocalData() {
      $log.debug('Loading authentication data...');
      // Get saved access token
      info.accessTokenInfo = storage.getObject('authentication.accessTokenInfo');
      // Get saved user info
      info.me = storage.getObject('authentication.me');
      // We are authenticated if we have an user data and an access token
      info.isAuthenticated = angular.isDefined(info.me && info.accessTokenInfo);
      info.isAuthorized = !isAccessTokenExpired();
    }

    loadLocalData();
    // Refresh the access token if needed
    if (isAccessTokenExpired()) {
      refreshAccessToken();
    }

    return {
      info: info
    // Authorize the user already authenticated using the saved tokens
    , authorize: function() {
        var deferred = $q.defer()
          , that = this;

        function failed() {
          // Cannot authorize, should re-authenticate
          info.isAuthorized = false;
          info.isAuthenticated = false;
          deferred.reject('Could not authorize.');
        }

        if (!angular.isDefined(info.accessTokenInfo
                            && info.accessTokenInfo.refresh_token)) {
          // Cannot authorize because we don't have the required token
          failed();
        } else {
          // Let's request a refreshed access token
          refreshAccessToken().then(function() {
            deffered.resolve('Authorized.');
          }, function(error) { failed(error); });
        }
        // The authorization process is async
        return deferred.promise;
      }
    // Force a new authentication using OAuth2
    , authenticate: function() {
        var deferred = $q.defer()
          , appScope = [];

        // Let's authenticate
        OAuth.meppit.authenticate(appScope).then(
          function(result) {
            saveAccessToken(result);
            deferred.resolve();
          }, function(error) {
            // Failed
            info.isAuthenticated = false;
            info.isAuthorized = false;
            deferred.reject(error);
          });
        // The authentication process is async
        return deferred.promise;
      }
    , forget: function() {
      info.isAuthenticated = false;
      info.isAuthorized = false;
      info.accessTokenInfo = undefined;
      info.me = undefined;
      storage.delete('authentication.me');
      storage.delete('authentication.accessTokenInfo');
    }
      // Return the HTTP header used to grant authorization
    , getAuthorizationHeader: function() {
        if (!angular.isDefined(info.accessTokenInfo)) { return ''; }
        return 'Bearer ' + info.accessTokenInfo.access_token;
      }
    };
  }]);

  return moduleName;
})(angular);
