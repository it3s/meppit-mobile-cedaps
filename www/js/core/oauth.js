define(['angular', 'config', 'core/network']
, function(angular, config, network) {

  'use strict';

  var moduleName = 'app.core.oauth'
    , moduleDeps = [network];

  angular.module(moduleName, moduleDeps)
  .factory('OAuth', ['$ionicPlatform', '$log', '$q', '$http', 'networkFactory'
, function ($ionicPlatform, $log, $q, $http, networkFactory) {
    var redirectUri = 'http://localhost/callback'
      , clientId = config.oauth.clientId
      , clientSecret = config.oauth.clientSecret
      , hasPlugin
      , sendToken
      , defaults = {
          protocol: 'https'
        , host: 'meppit.com'
        , port: ''
        , path: 'oauth'
        }
      , network = networkFactory(angular.extend({}, defaults, config.oauth));

    hasPlugin = function(pluginName) {
      var cordovaMetadata;
      if (!angular.isDefined(window.cordova)) {
        return false;
      }
      cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
      return cordovaMetadata.hasOwnProperty(pluginName) === true;
    };

    $ionicPlatform.ready(function() {
      // Use the local test uri if running inside a web browser
      if (!hasPlugin("org.apache.cordova.inappbrowser")) {
        redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
      }
    });

    sendToken = function(redirectUri, token, grantType) {
      var deferred = $q.defer()
        , postData = {
            grant_type: grantType
          , client_id: clientId
          , client_secret: clientSecret
          , redirect_uri: redirectUri
        };
      if (grantType === 'refresh_token') {
        postData['refresh_token'] = token;
      } else {
        postData['code'] = token;
      }
      $http.defaults.headers.post['Content-Type'] =
        'application/x-www-form-urlencoded';
      $http.defaults.headers.post['Accept'] = 'application/json';
      $http({method: "post", url: network.urlFor('/token')
                           , data: network.encodeParams(postData)})
      .success(function (data) {
        $log.info(data);
        deferred.resolve(data);
      })
      .error(function (data, status) {
        deferred.reject('Problem authenticating');
      });
      return deferred.promise;
    };

    return {
      meppit: {
        authenticate: function (appScope) {
          var deferred = $q.defer()
            , browserRef
            , authorizationCode
            , sendAuthorizationToken
            , urlParams = {
                client_id: clientId
              , redirect_uri: redirectUri
              , scope: appScope.join(',')
              , response_type: 'code'
              };

          sendAuthorizationToken = function(token) {
            sendToken(redirectUri, token, 'authorization_code')
            .then(function() {
              deferred.resolve.apply(this, arguments);
            }, function() {
              deferred.reject.appy(this, arguments);
            })
          };

          // Open the authorization window
          browserRef = $cordovaInAppBrowser.open(
            network.urlFor('/authorize' , urlParams), '_blank'
          , 'location=no,clearsessioncache=yes,clearcache=yes');

          if (hasPlugin("org.apache.cordova.inappbrowser")) {
            // Get the authorization code from url
            browserRef.addEventListener('loadstart', function (event) {
              if (event.url.indexOf(redirectUri) === 0) {
                authorizationCode = event.url.split('code=')[1];
                sendAuthorizationToken(authorizationCode);
                browserRef.close();
              }
            });
          } else {
            if (!angular.isDefined(window.cordova)) {
              window.sendCode = sendAuthorizationToken;
              $log.info("call sendCode('AuthorizationCodeFromPopUp')");
            } else {
              deferred.reject('Could not find InAppBrowser plugin');
            }
          }
          return deferred.promise;
        }
      , refreshAccessToken: function(refreshToken) {
          return sendToken(clientId, clientSecret, redirectUri, refreshToken
                         , 'refresh_token')
        }
      }
    }
  }]);

  return moduleName;
});
