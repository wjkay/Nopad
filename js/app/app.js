var Nopad = angular.module('Nopad', []);


Nopad.factory('page', function() {
   var title = 'Nopad';
   return {
     title: function() { return title; },
     setTitle: function(newTitle) { title = newTitle }
   };
});
