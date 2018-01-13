Nopad.filter('timeSinceFilter', function() {
	return function(date) {
		if (!date || isNaN( date.getTime())) {
			return "Not sure when last saved"
		}
		if (typeof date.getMonth === 'function') {
			var today = Date.now();
			var difference = parseInt((today-date)/1000);

			if (difference <= 2) {
				return 'Saved about a second ago';
			}
			if (difference <= 60) {
				return 'Saved ' + parseInt(difference) + ' seconds ago';
				//return 'Saved less than a minute ago';
			}
			if (difference <= 60 * 2) {
				return 'Saved a minute ago';
			}
			if (difference <= (60 * 60)) {
				return 'Saved ' + parseInt(difference /60) + ' minutes ago';
			}
			if (difference <= 60 * 60 * 2) {
				return 'Saved an hour ago';
			}
			if (difference <= (60 * 60 * 24)) {
				return 'Saved ' + parseInt(difference /(60 * 60)) + ' hours ago';
			}
			if (difference <= (60 * 60 * 24 * 2)) {
				return 'Saved a day ago';
			}
			if (difference <= (60 * 60 * 24 * 7)) {
				return 'Saved ' + parseInt(difference/(60 * 60 * 24)) + ' days ago';
			}
			if (difference <= (60 * 60 * 24 * 7 * 2)) {
				return 'Saved a week ago';
			}
			if (difference <= (60 * 60 * 24 * 7 * 4)) {
				return 'Saved ' + parseInt(difference/(60 * 60 * 24 * 7)) + ' weeks ago';
			}
			if (difference <= (60 * 60 * 24 * 7 * 4 * 2)) {
				return 'Saved a month ago';
			}
			if (difference <= (60 * 60 * 24 * 7 * 52)) {
				return 'Saved ' + parseInt(difference/(60 * 60 * 24 * 7 * 4)) +  ' months ago' ;
			}
			today = new Date(today);
			if (today.getFullYear() - date.getFullYear() == 1) {
				return 'Saved a year ago';
			}
			else {
				return 'Saved ' + today.getFullYear()-date.getFullYear() + ' years ago';
			}
		}
		return "No idea when this was saved"
	}
});