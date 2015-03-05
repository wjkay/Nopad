var background = chrome.extension.getBackgroundPage();

var Nopad = angular.module('Nopad', ['monospaced.elastic']);


Nopad.factory('page', function() {
   var title = 'Nopad';
   return {
     title: function() { return title; },
     setTitle: function(newTitle) { title = newTitle }
   };
});

Nopad.directive('stopEvent', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            element.bind('click', function (e) {
                e.stopPropagation();
            });
        }
    };
 });

Nopad.directive('focusOn', function() {
   return function(scope, elem, attr) {
      scope.$on('focusOn', function(e, name) {
        if(name === attr.focusOn) {
          elem[0].focus();
        }
      });
   };
});

Nopad.factory('focus', function ($rootScope, $timeout) {
  return function(name) {
    $timeout(function (){
      $rootScope.$broadcast('focusOn', name);
    });
  }
});