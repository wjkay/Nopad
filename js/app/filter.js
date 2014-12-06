Nopad.filter('timeSinceFilter', function() {
	return function(date) {
		if (date) {
			var difference = parseInt((Date.now()-date)/1000);

			if (difference <= 1) {
				return "less than a second ago";
			}
			if (difference <= 60) {
				return parseInt(difference) + " seconds ago";
			}
			if (difference <= 60 * 2) {
				return "a minute ago";
			}
			if (difference <= (60 * 60)) {
				return parseInt(difference /60) + " minutes ago";
			}
			if (difference <= 60 * 60 * 2) {
				return "an hour ago";
			}
			if (difference <= (60 * 60 * 24)) {
				return parseInt(difference /(60 * 60)) + " hours ago";
			}
			if (difference <= (60 * 60 * 24 * 2)) {
				return "a day ago";
			}
			if (difference <= (60 * 60 * 24 * 7)) {
				return parseInt(difference/(60 * 60 * 24)) + " days ago";
			}
			if (difference <= (60 * 60 * 24 * 7 * 2)) {
				return "a week ago";
			}
			if (difference <= (60 * 60 * 24 * 7 * 4)) {
				return parseInt(difference/(60 * 60 * 24 * 7)) + " weeks ago";
			}
			if (difference <= (60 * 60 * 24 * 7 * 4 * 2)) {
				return ('a month ago');
			}
			if (difference < (60 * 60 * 24 * 7 * 52)) {
				var d1Y = d1.getFullYear();
				var d2Y = d2.getFullYear();
				var d1M = d1.getMonth();
				var d2M = d2.getMonth();
	 
				return (d2M+12*d2Y)-(d1M+12*d1Y) + ' months ago' ;
			}
			if (d2.getFullYear()-d1.getFullYear() == 1) {
				return ('a year ago');
			}
			else {
				return d2.getFullYear()-d1.getFullYear() + ' years ago';
			}
		}
	}
});