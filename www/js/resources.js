'use strict'

angular.module('app.resources', ['ngResource'])

  .factory('resource', ['$q', '$state', '$resource', 'api', 'authentication'
, function($q, $state, $resource, api, authentication) {
    var resourceFactory
      , callNgResourceFunction
      , deferredCall
      , contentTypes = {
          json:    'application/json'
        , geojson: 'application/vnd.geo+json'
        };

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
      var url = api.urlFor(endpoint)
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
        angular.forEach(_actions, function(opts, action) {
          if (action === 'query' && queryReturnsArray === false) {
            opts.isArray = false;
          }
          if (angular.isDefined(_headers)) {
            // Add Authorization header to all actions
            if (!angular.isDefined(opts.headers)) { opts.headers = {}; }
            angular.extend(opts.headers, _headers)
          }
          // Converts actions endpoint to absolute url
          if (angular.isDefined(opts.url)) { opts.url = api.urlFor(opts.url); }
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
            , headers = angular.extend({
                'Accept': contentTypes[type]
              }, headersDefaults);
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
              authentication.authenticate().then(function() {
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

  .factory('geoDataResource', ['resource', 'api', function(resource, api) {
    return resource('/geo_data/:geoDataId', { geoDataId: '@id' });
  }])

  .factory('UsersResource', ['resource', 'api', function(resource, api) {
    return resource('/users/:userId'
                  , { userId: '@id' }
                  , { me: { url: '/me', method: 'GET' } });
  }]);
