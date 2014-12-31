define(['angular'], function (angular) {

  'use strict';

  var moduleName = 'app.core.datasource'
    , moduleDeps = [];

  angular.module(moduleName, moduleDeps)

  .factory('datasource', ['$q', function ($q) {
    return function(resource, callback) {
      var collection = []
        , datasource;

      datasource = angular.extend({
        get: function(index, count, success) {
          var first = index - 1
            , last  = first + count
            , that = this;

          // Should not scroll to negative position
          if (first < 0) {
            first = 0;
          }

          if (resource.params.per < count) {
            resource.params.per = count;
          }

          function loadMore() {
            var deferred = $q.defer();

            resource.query({}, function(items, responseHeaders) {
              angular.forEach(items, function(item) {
                collection.push(item);
              });
              resource.nextPage();
              that.resolve(items);
              deferred.resolve(items);
            }, function(error) {
              that.reject(error);
              deferred.reject(error);
            });
            // Return a promise because the resource query is async
            return deferred.promise;
          };

          function send() {
            var items = collection.slice(first, last);
            success(items);
            if (angular.isFunction(callback)) {
              callback(items);
            }
          };

          if (collection.length < last) {
            loadMore().then(send);
          } else if (collection.length <= last + resource.params.per) {
            send();
            loadMore();
          } else {
            send()
          }
        }
      }, $q.defer());

      return datasource;
    };
  }]);

  return moduleName;
});
