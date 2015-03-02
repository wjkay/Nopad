var operationsInMinute = 0;
var operationsInHour = 0;
setInterval(function(){operationsInMinute = 0;}, 60000);
setInterval(function(){operationsInHour = 0;}, 3600000);

function sync(key, value) {
	operationsInMinute++;
	operationsInHour++;
	console.log('Saving - Key:' + key + ' value:' + value)
	chrome.storage.sync.set(key, value);
};

function saveOnClose(note) {
	console.log('Closed - Saving')
	saveLocalToSync(note);
}

function saveLocalToSync () {
	console.log('Beguinning save to sync')
	chrome.storage.local.get('index', function (local) {
		var localIndex = local.index;
		var toSaveCount = 0;
		var notes = [];
		

		for (var id in localIndex) {
			notes.push(localIndex[id]);
		}
		console.log('Got notes: ', notes)
		for (var i = 0; i < notes.length; i++) { // iteration is issue
			console.log(i)
			chrome.storage.local.get(notes[i].id, function (bodyObj) {
				console.log("Got local note:" + notes[i].id)

				console.log('Got bodyObj: ' + bodyObj[notes[i].id]);

				var body = bodyObj[notes[i].id];

				if (operationsInMinute < 120 && operationsInHour < 1800) { 
					console.log('Saving: ' + notes[i].title + ' - ' + body);
					sync(notes[i].id, body);
					note.changed = false;
					note.date = new date();
					toSaveCount--;
					if (!toSaveCount) {
						console.log('Saving sync index');
						sync('index', localIndex)
					}
					return;
				}
			})
		}
	});
}

function deleteNotes() {
	chrome.storage.local.clear();
	chrome.storage.sync.clear();
}
function printNotes() {
    chrome.storage.sync.get(null, function(items) {
		var allKeys = Object.keys(items);
		console.log('All Sync: ',allKeys);
	})
}