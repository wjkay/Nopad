var operationsInMinute = 0;
var operationsInHour = 0;
setInterval(function(){operationsInMinute = 0;}, 60000);
setInterval(function(){operationsInHour = 0;}, 3600000);

function sync(key, value) {
	operationsInMinute++;
	operationsInHour++;
	chrome.storage.sync.set(key, value);
};

function saveOnClose(note) {
	// Duplication is evil but note following not working
	chrome.storage.sync.get('index', function (syncIndex) {
		syncIndex = syncIndex.index;
		if (!syncIndex) {syncIndex = {};}
		if (note.newTitle) {
			note.title = note.newTitle;
			note.newTitle = '';
		}
		note.date = Date.now();
		note.new = false;
		note.changed = false;
		
		syncIndex[note.id] = {"id":note.id,"title":note.title,"date":note.date,"active":note.active};
		
		chrome.storage.local.set({'index': syncIndex})
		chrome.storage.sync.set({'index': syncIndex})
		
		// Save note
		var toStore = {};
		toStore[note.id] = note.body;
		chrome.storage.local.set(toStore)
		chrome.storage.sync.set(toStore, function() { })
	});
}

function saveLocalToSync () {
	chrome.storage.local.get('index', function (local) {
		var localIndex = local.index;
		var notes = [];
		var toSaveCount = 0;

		for (var i = 0;i < localIndex.length; i++) {
			var note = localIndex[i];
			chrome.storage.local.get(notes[i].id, function (bodyObj) {
				var body = bodyObj[notes[i].id];
				if (operationsInMinute < 120 && operationsInHour < 1800) { 
					sync(note.id: body});
					note.changed = false;
					note.date = new date();
					toSaveCount--;
					if (!toSaveCount) {
						sync('index', localIndex)
					}
					return;
				}
			})
		}
	}
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