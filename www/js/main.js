/*
    File: main.js
    Author: Luiz Armesto
    Description: Loads up the app and all dependencies
*/

require.config({
  paths: {
    cordova:    '../cordova'
  , vendor:     '../lib/vendor/js'
  , ngCordova:  '../lib/vendor/js/ng-cordova.min'
  , angular:    '../lib/ionic/js/angular/angular'
  , ngAnimate:  '../lib/ionic/js/angular/angular-animate'
  , ngResource: '../lib/ionic/js/angular/angular-resource'
  , ngSanitize: '../lib/ionic/js/angular/angular-sanitize'
  , uiRouter:   '../lib/ionic/js/angular-ui/angular-ui-router'
  , ionic:      '../lib/ionic/js/ionic'
  , ngIonic:    '../lib/ionic/js/ionic-angular'
  , meppit:     '../lib/vendor/js/meppit-map.full'
  }
, shim: {
    'angular': {
      exports: 'angular'
    }
  , 'ngCordova': {
      deps: ['angular', 'cordova']
    , init: function() { return 'ngCordova'; }
    }
  , 'ngAnimate': {
      deps: ['angular']
    , init: function() { return 'ngAnimate'; }
    }
  , 'ngResource': {
      deps: ['angular']
    , init: function() { return 'ngResource'; }
    }
  , 'ngSanitize': {
      deps: ['angular']
    , init: function() { return 'ngSanitize'; }
    }
  , 'uiRouter': {
      deps: ['angular']
    , init: function() { return 'ui.router'; }
    }
  , 'ionic': {
      exports: 'ionic'
    }
  , 'ngIonic': {
      deps: ['angular', 'ionic', 'uiRouter', 'ngAnimate', 'ngResource', 'ngSanitize']
    , init: function() { return 'ionic'; }
  }
  , 'vendor/scroll-jqlite': ['angular']
  , 'vendor/scroll': {
      deps: ['angular', 'vendor/scroll-jqlite']
    , init: function(angular) {
        // Create a module to include its dependencies
        angular.module('vendor.ui.scroll', ['ui.scroll', 'ui.scroll.jqlite']);
        return 'vendor.ui.scroll';
      }
    }
  }
, priority: ['angular']
});

require(['cordova', 'ionic', 'angular', 'app']
, function(cordova, ionic, angular, app) {

  'use strict';

  var start = function(){
    angular.bootstrap(document, ['app']);
  }
  if (document.body) {
    start();
  } else {
    ionic.Platform.ready(start);
  }
});
