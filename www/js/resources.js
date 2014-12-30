define(['angular'
       , 'ngResource'
       , 'api'
       , 'utils/network'
       , 'authentication/authenticationService']
, function(angular, ngResource, api, networkUtils, authentication) {

  'use strict';

  var moduleName = 'app.resources'
    , moduleDeps = [ngResource, api, networkUtils, authentication];

  angular.module(moduleName, moduleDeps)

  .factory('resourceFactory', ['$q'
                             , '$state'
                             , '$resource'
                             , 'api'
                             , 'networkFactory'
                             , 'authentication'
, function($q, $state, $resource, api, networkFactory, authentication) {
    var resourceFactory
      , network = networkFactory(api)
      , callNgResourceFunction
      , deferredCall
      , contentTypes = {
          json:    'application/json'
        , geojson: 'application/vnd.geo+json'
        }
      , defaultContentType = 'json';

    callNgResourceFunction = function(ngResource, fnName, params, args) {
      args[0] = angular.extend({}, params, args[0]);
      return ngResource[fnName].apply(ngResource, args).$promise;
    };

    deferredCall = function(promises, fn, fnArgs) {
      var deferred = $q.defer();
      $q.all(promises).then(function() {
        $q.when(fn.apply(this, fnArgs)).then(function() {
          deferred.resolve.apply(this, arguments);
        }, function() {
          deferred.reject.apply(this, arguments);
        }, function() {
          deferred.notify.apply(this, arguments);
        });
      });
      return deferred.promise;
    }

    resourceFactory = function(endpoint, paramDefaults, actions, options) {
      var url = network.urlFor(endpoint)
        , result
        , actionsDefaults = {
            'get': { method: 'GET' }
          , 'save': { method: 'POST' }
          , 'query': { method: 'GET', isArray: true }
          , 'remove': { method: 'DELETE' }
          , 'delete': { method: 'DELETE' }
          }
        , headersDefaults = {
            Authorization: function() {
              return authentication.getAuthorizationHeader();
            }
          , Accept: contentTypes[defaultContentType]
          }
        , createNgResource;

      createNgResource = function(headers, queryReturnsArray) {
        var _actions
          , _headers
          , ngResource;
        // Merge actions defaults with custom actions
        _headers = angular.copy(headers);
        _actions = angular.extend({}, angular.copy(actionsDefaults)
                                    , angular.copy(actions));
        angular.forEach(_actions, function(action, name) {
          if (name === 'query' && queryReturnsArray === false) {
            action.isArray = false;
          }
          if (angular.isDefined(_headers)) {
            // Add Authorization header to all actions
            if (!angular.isDefined(action.headers)) { action.headers = {}; }
            angular.extend(action.headers, _headers)
          }
          // Converts actions endpoint to absolute url
          if (angular.isDefined(action.url)) {
            action.url = network.urlFor(action.url);
          }
        });
        ngResource = $resource(url, paramDefaults, _actions, options);
        ngResource.__actions = _actions;
        return ngResource;
      };

      result = {
        endpoint: endpoint
      , ngResource: createNgResource(headersDefaults)
      , params:   {}
      , promises: []
      , nextPage: function() { this.params.page = (this.params.page || 1) + 1; }
      , as: function(type) {
          var copy = this.clone()
            , headers = angular.extend({}, headersDefaults, {
                'Accept': contentTypes[type]
              });
          copy.ngResource = createNgResource(headers, false);
          return copy;
        }
      , clone: function() {
          // Create a  shallow copy of this object
          var copy = angular.extend({}, this);
          // Override the properties that store states
          copy.promises = this.promises.slice();
          copy.params   = angular.copy(this.params);
          // Wait until the last chained call be resolved
          $q.when(this.promises[this.promises.length - 1]).then(function(params) {
            // Copy all params already defined
            angular.extend(copy.params, params);
          });
          // return the copy we created
          return copy;
        }
      };
      // Create setters. List format: [methodName, paramKey]
      [ ['sortBy', 'sort']
      , ['page',   'page']
      , ['per',    'per']
      , ['where',  'params'] ].forEach(function(item) {
        var methodName = item[0]
          , paramKey   = item[1];

        // Define a setter method
        result[methodName] = function(value) {
          var deferred = $q.defer()
            , copy = this.clone();
          copy.promises.push(deferred.promise);
          // Wait until the last chained call be resolved
          $q.when(this.promises[this.promises.length - 1]).then(function(params) {
            // Set the param been defined by this call
            $q.when(value).then(function(value) {
              if (paramKey == 'params') {
                angular.extend(copy.params, value);
              } else {
                copy.params[paramKey] = value;
              }
              // resolve the current call promise sending the current params
              deferred.resolve(copy.params);
            });
          });
          return copy;
        };
      });
      // Create a method for each action
      angular.forEach(result.ngResource.__actions, function(opts, action) {
        result[action] = function() {
          var deferred = $q.defer()
            , args = arguments
            , that = this
            , call = function() {
                return deferredCall(that.promises
                                  , callNgResourceFunction
                                  , [that.ngResource, action, that.params, args]);
            };
          // Try to get the resource content
          call().then(function() {
            // Success
            deferred.resolve.apply(this, arguments);
          }, function(response) {
            // An error occurred
            if (response.status === 401) {
              // Unauthorized. Let's try to authenticate
              authentication.authorize().then(function() {
                // Authenticated. Retry
                call().then(function() {
                  // Success
                  deferred.resolve.apply(this, arguments);
                }, function(response) {
                  // An error occurred again. Rejected.
                  // TODO: Go to home and display an error message
                  deferred.reject(response.statusText
                                + ' (' + response.status + ')');
                });
              }, function(error) {
                // Problem authenticating
                deferred.reject.apply(error);
              });
            } else {
              // Unknow error
              // TODO: Go to home and display an error message
              deferred.reject(response.statusText
                            + ' (' + response.status + ')');
            }
          });
          return deferred.promise;
        };
      });
      return result;
    };

    return resourceFactory;
  }])

  angular.injector([api]).invoke(['api', function(api) {
    // Create dynamically resources for all configured API endpoints
    angular.forEach(api.endpoints, function(endpoint, name) {
      angular.module(moduleName)
      .factory(name + 'Resource', ['resourceFactory', function(resource) {
        return resource(endpoint.path
                       , endpoint.params
                       , endpoint.actions
                       , endpoint.options);
      }]);
    });
  }]);

  return moduleName;
});
