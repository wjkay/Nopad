	var background = chrome.extension.getBackgroundPage();

var app = angular.module('app', []);


angular.element(document).ready(function() {
	angular.bootstrap(document, ['app']);
});

app.controller("optionsCtrl", function ($scope, $timeout) {
	var self = this;


	chrome.storage.sync.get('settings', function (data) {
		$scope.settings = data['settings'];
		$scope.settingLabels = [];
		for (var key in $scope.settings) {
			$scope.settingLabels.push(key);
		}
		console.log($scope.settingLabels)
		$scope.$apply();
	});	



	$scope.save = function() {
		$timeout.cancel(self.saveTimeout);
		// This timeout should be moved into background
		self.saveTimeout = $timeout(function() {
			var background = chrome.extension.getBackgroundPage();
			background.sync({'settings': $scope.settings});
			console.log('Saving Settings')
		 }, 100);

	}


});
