'use strict'

angular.module('app.services', ['app.oauth'])

  .factory('api', function() {
    // Define the API info
    return {
      protocol: 'http'
    , host: '192.168.0.107'
    , port: ''
    , path: 'api'
    , version: 'v1'
    , baseUrl: function() {
        return this.protocol + '://'
             + this.host + (this.port ? ':' + this.port : '') + '/'
             + this.path + '/' + this.version;
      }
    , urlFor: function(endpoint) {
        return this.baseUrl() + endpoint;
      }
    };
  })

  .provider('authentication', function AuthenticationProvider() {
    var clientId = ''
      , clientSecret = ''
      , accessTokenInfo
      , me;

    this.config = function(id, secret) {
      clientId = id;
      clientSecret = secret;
    };

    this.$get = ['$q', '$injector', 'OAuth', 'localstorage'
  , function AuthenticationFactory($q, $injector, OAuth, localstorage) {
      var baseUrl = 'http://192.168.0.107';
      // Get saved access token
      accessTokenInfo = localstorage.getObject('authentication.accessTokenInfo');
      // Get saved user info
      me = localstorage.getObject('authentication.me');
      me.avatar_url = baseUrl + me.avatar;
      return {
        isAuthenticated: true  // TODO
      , currentUser: function() { return me; }
      , saveAccessToken: function(token) {
        this.isAuthenticated = true;
        // Save the access token
        accessTokenInfo = token;
        localstorage.setObject('authentication.accessTokenInfo'
                             , accessTokenInfo);
        // Use injector to avoid circular dependency
        $injector.invoke(['UsersResource', function(UsersResource) {
          // Get user data and save locally
          me = UsersResource.me();
          me.avatar_url = baseUrl + me.avatar;
          localstorage.setObject('authentication.me', me);
        }]);
      }
      , authorize: function() {
          var deferred = $q.defer()
            , that = this;
          if (!angular.isDefined(accessTokenInfo)
           || !angular.isDefined(accessTokenInfo.refresh_token)) {
            return this.authenticate();
          }
          OAuth.meppit.refreshAccessToken(clientId
                                        , clientSecret
                                        , accessTokenInfo.refresh_token
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
            , that = this;

          this.isAuthenticated = false;
          OAuth.meppit.authenticate(clientId, clientSecret, []).then(
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
    }];
  })

  .factory('localstorage', ['$window', '$q', function($window, $q) {
    return {
      set: function(key, value) {
        $q.when(value).then(function(value) {
          $window.localStorage[key] = value;
        });
      }
    , get: function(key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      }
    , setObject: function(key, value) {
        $q.when(value).then(function(value) {
          $window.localStorage[key] = angular.toJson(value);
        });
      }
    , getObject: function(key) {
        return angular.fromJson($window.localStorage[key] || '{}');
      }
    };
  }]);
