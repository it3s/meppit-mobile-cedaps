define(['angular'
      , 'geoData/controllers']
, function(angular, geoData) {

  'use strict';

  var moduleName = 'app.controllers'
    , moduleDeps = [geoData];

  angular.module(moduleName, moduleDeps);

  return moduleName;
});
