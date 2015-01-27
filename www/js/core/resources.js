define(['angular'
       , 'ngCordova'
       , 'ngResource'
       , 'core/api'
       , 'core/network'
       , 'core/native'
       , 'core/authentication']
, function(angular, ngCordova, ngResource, api, network, native, authentication) {

  'use strict';

  var moduleName = 'app.core.resources'
    , moduleDeps = [ngResource, api, network, native, authentication];

  angular.module(moduleName, moduleDeps)

  .factory('resourceFactory', ['$q'
                             , '$state'
                             , '$ionicHistory'
                             , '$ionicLoading'
                             , '$resource'
                             , 'api'
                             , 'networkFactory'
                             , 'toast'
                             , 'authentication'
, function($q, $state, $ionicHistory, $ionicLoading, $resource
         , api, networkFactory, toast, authentication) {
    var network = networkFactory(api)
      , contentTypes = {
          json:    'application/json'
        , geojson: 'application/vnd.geo+json'
        }
      , defaultContentType = 'json';

    // Call the original ngResource.resource functions and return a promise.
    function callNgResourceFunction(ngResource, fnName, params, args) {
      args[0] = angular.extend({}, params, args[0]);
      return ngResource[fnName].apply(ngResource, args).$promise;
    }

    // Call the function `fn` with `fnArgs` after all `promises` are resolved.
    // Return a promise that will be resolved with the function return or will
    // be rejected if some `promeses` are rejected.
    function deferredCall(promises, fn, fnArgs) {
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

    // resourceFactory allows the same arguments than ngResource.resource.
    function resourceFactory(endpoint, paramDefaults, actions, options) {
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
          };

      // Create the ngResource.resource adding authorization token as default
      // header.
      function createNgResource(headers, queryReturnsArray) {
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
      }

      result = {
        _redirectOnError: true
      , endpoint: endpoint
      , ngResource: createNgResource(headersDefaults)
      , params:   {}
      , promises: []
      , nextPage: function() { this.params.page = (this.params.page || 1) + 1; }
      // Select the format we want to receive from API server. Default: json
      , as: function(type) {
          var copy = this.clone()
            , headers = angular.extend({}, headersDefaults, {
                'Accept': contentTypes[type]
              });
          copy.ngResource = createNgResource(headers, false);
          return copy;
        }
      // Define if we should fail silently or redirect to home and display
      // an error message. Redirect by default.
      , silent: function(flag) {
        var copy = this.clone();
        if (!angular.isDefined(flag)) {
          flag = true;
        }
        copy._redirectOnError = !flag;
        return copy;
      }
      // Create a copy of this object
      , clone: function() {
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
      , ['where',  'params']
      ].forEach(function(item) {
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
            , retries = 0
            , totalRetries = 2
            , that = this;

          function failed(error) {
            deferred.reject.apply(error);
            console.log(error);
            if (that._redirectOnError) {
              $ionicLoading.hide();
              // TODO: Don't do it here. Emmit an event that will redirect, if
              // needed, somewhere else.
              $state.go('app.welcome');
              toast.show(error, 'long', 'center');
            }
            retries = 0;
          }

          function call() {
            // Will automatically retry some times if failed.
            retries++;
            deferredCall(that.promises
                       , callNgResourceFunction
                       , [that.ngResource, action, that.params, args])
            .then(function() {
              deferred.resolve.apply(this, arguments);
              // Reset retries counter
              retries = 0;
            }, function(response) {
              // An error occurred
              if (response.status === 401 && retries < totalRetries) {
                // Unauthorized. Let's try to re-authorize
                authentication.authorize().then(function() {
                  // Authorized. Retry
                  call();
                }, function(error) {
                  // Let's retry?
                  if (retries < totalRetries) {
                    call()
                  } else {
                    failed(error);
                  }
                });
              } else {
                // Let's retry?
                if (retries < totalRetries) {
                  call()
                } else {
                  failed(response.status + ' (' + response.statusText + ')');
                }
              }
            });
          }
          // Try to get the resource content
          call();
          // Return a promise because the requests are async.
          return deferred.promise;
        };
      });
      return result;
    }

    return resourceFactory;
  }])

  angular.injector([api]).invoke(['api', function(api) {
    // Create dynamically resources for all configured API resources
    // See `api.js`
    angular.forEach(api.resources, function(res, name) {
      angular.module(moduleName)
      .factory(name + 'Resource', ['resourceFactory', function(resourceFactory) {
        return resourceFactory(res.path
                             , res.params
                             , res.actions
                             , res.options);
      }]);
    });
  }]);

  return moduleName;
});
