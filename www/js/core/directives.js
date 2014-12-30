define(['angular', 'meppit'], function(angular, Meppit) {

  'use strict';

  var moduleName = 'app.core.directives'
    , moduleDeps = []

  angular.module(moduleName, moduleDeps)

  .directive('meppitMap', ['$sce'
                         , '$parse'
                         , '$compile'
                         , '$cordovaInAppBrowser'
, function($sce, $parse, $compile, $cordovaInAppBrowser){
    return {
      restrict: 'EA'
    , scope: {
        geojson: '=geojson'
      }
    , link: function(scope, element, attrs) {
        var map
          , updateWidth
          , updateHeight;

        // Set width and height utility functions
        updateWidth = function() {
          if (isNaN(attrs.width)) {
            element.css('width', attrs.width);
          } else {
            element.css('width', attrs.width + 'px');
          }
        };
        updateHeight = function() {
          if (isNaN(attrs.height)) {
            element.css('height', attrs.height);
          } else {
            element.css('height', attrs.height + 'px');
          }
        };

        element.css('display', 'block');
        updateHeight();
        updateWidth();

        map = new Meppit.Map({
          element: element[0]
        , center: [48.858333, 2.294444]
        , zoom: 13
        });

        map.show(scope.geojson);
      }
    };
  }])

  .directive('dynamicContent', ['$sce'
                              , '$parse'
                              , '$compile'
                              , '$cordovaInAppBrowser'
, function($sce, $parse, $compile, $cordovaInAppBrowser){
    return {
      restrict: 'A'
    , compile: function(tElement, tAttrs) {
        var dynamicContentGetter = $parse(tAttrs.dynamicContent)
          , dynamicContentWatch  = $parse(tAttrs.dynamicContent);

        $compile.$$addBindingClass(tElement);

        return function(scope, element, attr) {
          $compile.$$addBindingInfo(element, attr.dynamicContent);

          scope.$watch(dynamicContentWatch, function() {
            // we re-evaluate the expr because we want a TrustedValueHolderType
            // for $sce, not a string
            var html = $sce.getTrustedHtml(dynamicContentGetter(scope)) || ''
              , matches = html.match(/href="(.+?)"/g)
              , pageEl;

            if (matches) {
              angular.forEach(matches, function(href){
                var url = href.match(/href="(.+?)"/)[1]
                // Make all links open in system browser
                html = html.replace(href
                                  , 'ng-click="loadPage(\'' + url + '\')"')
              });
            }
            // Define the function used to open external links in system browser
            scope.loadPage = function(url) {
              $cordovaInAppBrowser.open(url, '_system')
              return false;
            };
            // Append the dynamic content to DOM tree
            pageEl = $compile(html)(scope);
            element.append(pageEl);
            element.addClass("dynamic-content");
          });
        };
      }
    };
  }]);

  return moduleName;
});
