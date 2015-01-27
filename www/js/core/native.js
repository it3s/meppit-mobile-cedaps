define(['angular', 'ngCordova'], function(angular, ngCordova) {

  'use strict';

  var moduleName = 'app.core.native'
    , moduleDeps = [ngCordova];

  // Check if a specified cordova plugin is included.
  function hasPlugin(pluginName) {
    var cordovaMetadata;
    if (!angular.isDefined(window.cordova)) {
      return false;
    }
    cordovaMetadata = cordova.require("cordova/plugin_list").metadata;
    return cordovaMetadata.hasOwnProperty(pluginName) === true;
  }

  angular.module(moduleName, moduleDeps)

  .factory('hasPlugin', [function() {
    return hasPlugin;
  }])

  .factory('toast', ['$cordovaToast', function($cordovaToast) {
    return {
      show: function(message, duration, position) {
        if (hasPlugin('nl.x-services.plugins.toast')) {
          $cordovaToast.show(message, duration, position);
        } else {
          // Fallback for browser
          alert(message + '\n\nduration: ' + duration + ', position: ' + position);
        }
      }
    };
  }]);

  return moduleName;

});
