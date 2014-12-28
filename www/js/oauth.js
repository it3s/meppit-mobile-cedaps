angular.module('app.oauth', ['ngCordova.plugins.oauthUtility'])
  .factory('OAuth', ['$q', '$http', '$cordovaOauthUtility'
, function ($q, $http, $cordovaOauthUtility) {
    var redirectUri = 'http://localhost/callback'
      , baseUrl     = 'http://192.168.0.107'
      , hasPlugin
      , sendToken;

    hasPlugin = function(pluginName) {
      var cordovaMetadata;
      if (!angular.isDefined(window.cordova)) {
        return false;
      }
      cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
      return cordovaMetadata.hasOwnProperty(pluginName) === true;
    };

    // Use the local test uri if running inside a web browser
    if (!hasPlugin("org.apache.cordova.inappbrowser")) {
      redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
    }

    sendToken = function(clientId, clientSecret, redirectUri, token, grantType) {
      var deferred = $q.defer();
      $http.defaults.headers.post['Content-Type'] =
        'application/x-www-form-urlencoded';
      $http.defaults.headers.post['Accept'] = 'application/json';
      $http({method: "post", url: baseUrl + '/oauth/token', data:
            'grant_type=' + grantType
          + '&client_id=' + clientId
          + '&client_secret=' + clientSecret
          + '&redirect_uri=' + redirectUri
          + (grantType === 'refresh_token' ? '&refresh_token=' : '&code=')
          + token})
      .success(function (data) {
        console.log(data);
        deferred.resolve(data);
      })
      .error(function (data, status) {
        deferred.reject('Problem authenticating');
      });
      return deferred.promise;
    };

    return {
      meppit: {
        authenticate: function (clientId, clientSecret, appScope) {
          var deferred = $q.defer()
            , browserRef
            , requestToken
            , sendAuthorizationToken;

          sendAuthorizationToken = function(token) {
            sendToken(clientId, clientSecret, redirectUri, token
                    , 'authorization_code').then(function(){
              deferred.resolve.apply(this, arguments)
            }, function(){
              deferred.reject.apply(this, arguments)
            });
          };

          // Open the authorization window
          browserRef = window.open(
            baseUrl + '/oauth/authorize'
                    + '?client_id=' + clientId
                    + '&redirect_uri=' + redirectUri
                    + '&scope=' + appScope.join(',')
                    + '&response_type=code'
            , '_blank'
            , 'location=no,clearsessioncache=yes,clearcache=yes');

          if (hasPlugin("org.apache.cordova.inappbrowser")) {
            browserRef.addEventListener('loadstart', function (event) {
              if (event.url.indexOf(redirectUri) === 0) {
                requestToken = event.url.split("code=")[1];
                sendAuthorizationToken(requestToken);
                browserRef.close();
              }
            });
          } else {
            if (!angular.isDefined(window.cordova)) {
              window.sendToken = sendAuthorizationToken;
              console.log("call sendRequestToken('RequestTokenFromPopUp')");
            } else {
              deferred.reject('Could not find InAppBrowser plugin');
            }
          }
          return deferred.promise;
        }
      , refreshAccessToken: function(clientId, clientSecret, refreshToken) {
          var deferred = $q.defer();
          sendToken(clientId, clientSecret, redirectUri, refreshToken
                  , 'refresh_token').then(function(){
            deferred.resolve.apply(this, arguments)
          }, function(){
            deferred.reject.apply(this, arguments)
          });
          return deferred.promise;
        }
      }
    }
  }]);
