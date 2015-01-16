Nopad.filter('timeSinceFilter', function() {
	return function(date) {
		if (date) {
			var difference = parseInt((Date.now()-date)/1000);

			if (difference <= 1) {
				return 'Saved less than a second ago';
			}
			if (difference <= 60) {
				return 'Saved ' + parseInt(difference) + ' seconds ago';
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
			if (difference < (60 * 60 * 24 * 7 * 52)) {
				var d1Y = d1.getFullYear();
				var d2Y = d2.getFullYear();
				var d1M = d1.getMonth();
				var d2M = d2.getMonth();
	 
				return 'Saved ' + (d2M+12*d2Y)-(d1M+12*d1Y) + ' months ago' ;
			}
			if (d2.getFullYear()-d1.getFullYear() == 1) {
				return 'Saved a year ago';
			}
			else {
				return 'Saved ' + d2.getFullYear()-d1.getFullYear() + ' years ago';
			}
		}
	}
});