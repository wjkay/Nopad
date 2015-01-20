

function saveOnClose(note) {
	/*console.log('Saving note: ', note);
	note.save( function () { 
		console.log('saved');
	});*/
	
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