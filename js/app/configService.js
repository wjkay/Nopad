Nopad.service('config', function($timeout) {
	return {
		'saveTimeout': null,
		'settings': {},
		init(){
			var self = this;
			var background = chrome.extension.getBackgroundPage();
			chrome.storage.sync.get('settings', function (data) {
				self.settings = data['settings'] || {
					height: '',
				};
				
				var textbox = document.getElementById("noteBody");
				if (self.settings.height)
				{
					textbox.style.height = self.settings.height;
				}
				new MutationObserver(function () {
				 	self.settings.height = textbox.offsetHeight
				 	self.save();
				}).observe(textbox, {
				 	attributes: true, attributeFilter: [ "style" ]
				})
			
			});	
		},
		save() {
			var self = this;
			$timeout.cancel(self.saveTimeout);
			// This timeout should be moved into background
			self.saveTimeout = $timeout(function() {
				var background = chrome.extension.getBackgroundPage();
				background.sync({'settings': self.settings});
				console.log('Saving Settings')
			 }, 100);


		},
	}
});