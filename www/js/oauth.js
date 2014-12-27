angular.module('app.oauth', ['ngCordova.plugins.oauthUtility'])
  .factory('OAuth', ['$q', '$http', '$cordovaOauthUtility'
, function ($q, $http, $cordovaOauthUtility) {
    return {
      meppit: function (clientId, clientSecret, appScope) {
        var baseUrl     = 'http://192.168.0.107'
          , redirectUri = 'http://localhost/callback'
          , deferred    = $q.defer()
          , hasPlugin
          , browserRef
          , requestToken;

        hasPlugin = function(pluginName) {
          var cordovaMetadata;
          if (!angular.isDefined(window.cordova)) {
            return false;
          }
          cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
          return cordovaMetadata.hasOwnProperty(pluginName) === true;
        };

        if (hasPlugin("org.apache.cordova.inappbrowser")) {
          browserRef = window.open(
            baseUrl + '/oauth/authorize'
                    + '?client_id=' + clientId
                    + '&redirect_uri=' + redirectUri
                    + '&scope=' + appScope.join(',')
                    + '&response_type=code'
            , '_blank'
            , 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function (event) {
            if (event.url.indexOf(redirectUri) === 0) {
              requestToken = event.url.split("code=")[1];
              $http.defaults.headers.post['Content-Type'] =
                'application/x-www-form-urlencoded';
              $http.defaults.headers.post['Accept'] = 'application/json';
              $http({method: "post", url: baseUrl + '/oauth/token', data:
                    'grant_type=authorization_code'
                  + '&client_id=' + clientId
                  + '&client_secret=' + clientSecret
                  + '&redirect_uri=http://localhost/callback'
                  + '&code=' + requestToken})
                .success(function (data) {
                  deferred.resolve(data);
                })
                .error(function (data, status) {
                  deferred.reject('Problem authenticating');
                });
              browserRef.close();
            }
          });
        } else {
          if (!angular.isDefined(window.cordova)) {
            access_token = prompt('Cannot authenticate via a web browser.\n'
                                + 'Please, enter the access token manually');
            if (access_token) {
              deferred.resolve({access_token: access_token});
            } else {
              deferred.reject('Access token not provided');
            }
          } else {
            deferred.reject('Could not find InAppBrowser plugin');
          }
        }
        return deferred.promise;
      }
    }
  }]);
