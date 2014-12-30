define(['angular'], function (angular) {

  'use strict';

  var moduleName = 'app.core.datasource'
    , moduleDeps = [];

  angular.module(moduleName, moduleDeps)

  .factory('datasource', ['$q', function ($q) {
    return function(resource, callback) {
      var collection = []
        , loadMore
        , datasource;

      loadMore = function() {
        var deferred = $q.defer();

        resource.query({}, function(items, responseHeaders) {
          angular.forEach(items, function(item) {
            collection.push(item);
          });
          resource.nextPage();
          deferred.resolve(items);
        });
        // Return a promise because the resource query is async
        return deferred.promise;
      };

      datasource = {
        get: function(index, count, success) {
          var first = index - 1
            , last  = first + count
            , send;

          // Should not scroll to negative position
          if (first < 0) {
            first = 0;
          }

          if (resource.params.per < count) {
            resource.params.per = count;
          }

          send = function() {
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
      };

      return datasource;
    };
  }]);

  return moduleName;
});
