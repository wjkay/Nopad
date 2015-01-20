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