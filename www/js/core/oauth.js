define(['angular', 'config', 'core/network', 'core/native']
, function(angular, config, network, native) {

  'use strict';

  var moduleName = 'app.core.oauth'
    , moduleDeps = [network, native];

  angular.module(moduleName, moduleDeps)
  .factory('OAuth', ['$ionicPlatform', '$log', '$q', '$http'
                   , 'networkFactory', 'hasPlugin'
, function ($ionicPlatform, $log, $q, $http, networkFactory, hasPlugin) {
    var redirectUri = 'http://localhost/callback'
      , clientId = config.oauth.clientId
      , clientSecret = config.oauth.clientSecret
      // You can edit `config.js` to use a custom host
      , defaults = {
          protocol: 'https'
        , host: 'meppit.com'
        , port: ''
        , path: 'oauth'
        }
      , network = networkFactory(angular.extend({}, defaults, config.oauth));

    $ionicPlatform.ready(function() {
      // Use the local test uri if running inside a web browser
      if (!hasPlugin('org.apache.cordova.inappbrowser')) {
        redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
      }
    });

    function sendToken(token, grantType) {
      var deferred = $q.defer()
          // Define the data we always have to send with the token.
        , postData = {
            grant_type: grantType
          , client_id: clientId
          , client_secret: clientSecret
          , redirect_uri: redirectUri
        };
      // Check which type of token we should send and select the right one.
      if (grantType === 'refresh_token') {
        postData['refresh_token'] = token;
      } else {
        postData['code'] = token;
      }
      // Define some headers.
      $http.defaults.headers.post['Content-Type'] =
        'application/x-www-form-urlencoded';
      $http.defaults.headers.post['Accept'] = 'application/json';
      // Make the POST request.
      $http({method: "post", url: network.urlFor('/token')
                           , data: network.encodeParams(postData)})
      .success(function (data) {
        $log.info(data);
        // Resolve the promise using the data received.
        deferred.resolve(data);
      })
      .error(function (data, status) {
        deferred.reject('Problem authenticating');
      });
      // Return a promise because the request is async.
      return deferred.promise;
    }

    return {
      meppit: {
        // OAuth2 authentication proccess.
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

          // Send the autorization token to server to get access and refresh
          // tokens.
          sendAuthorizationToken = function(token) {
            sendToken(token, 'authorization_code')
            .then(function() {
              deferred.resolve.apply(this, arguments);
            }, function() {
              deferred.reject.appy(this, arguments);
            })
          };

          // Open the authorization window
          browserRef = window.open(
            network.urlFor('/authorize' , urlParams), '_blank'
          , 'location=no,clearsessioncache=yes,clearcache=yes');

          // Running as hybrid app so we can get the authorization code directly
          // from browser.
          if (hasPlugin('org.apache.cordova.inappbrowser')) {
            // Get the authorization code from url
            browserRef.addEventListener('loadstart', function (event) {
              if (event.url.indexOf(redirectUri) === 0) {
                authorizationCode = event.url.split('code=')[1];
                sendAuthorizationToken(authorizationCode);
                browserRef.close();
              }
            });
          } else {
            // Running in normal webbrowser. Need user interection to copy the
            // authorization code and send throw console.
            if (!angular.isDefined(window.cordova)) {
              window.sendCode = sendAuthorizationToken;
              $log.info("call sendCode('AuthorizationCodeFromPopUp')");
            } else {
              deferred.reject('Could not find InAppBrowser plugin');
            }
          }
          return deferred.promise;
        }
      // Use the refresh token to get a new access token.
      , refreshAccessToken: function(refreshToken) {
          return sendToken(refreshToken, 'refresh_token')
        }
      }
    }
  }]);

  return moduleName;
});
