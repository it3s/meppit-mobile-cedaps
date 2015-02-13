app.core.ui = {};
app.core.ui.scroll = (function(angular) {

  'use strict';

  var moduleName = 'app.core.ui.scroll'
    , moduleDeps = ['ui.scroll', 'ui.scroll.jqlite'];

  angular.module(moduleName, moduleDeps);

  return moduleName;

})(angular);
