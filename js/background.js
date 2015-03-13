var operationsInMinute = 0;
var operationsInHour = 0;
setInterval(function(){operationsInMinute = 0;}, 60000);
setInterval(function(){operationsInHour = 0;}, 3600000);

var toSaveCount = 0;
var localIndex;

function sync(obj) {
	operationsInMinute++;
	operationsInHour++;
	chrome.storage.sync.set(obj);
};

function saveOnClose(note) {
	saveLocalToSync(note);
}

function saveLocalToSync () {
	chrome.storage.local.get('index', function (local) {
		localIndex = local.index;
		toSaveCount = 0;
		var notes = [];
		for (var id in localIndex) {
			if (localIndex[id].changed) {
				notes.push(localIndex[id]);
			}
		}
		console.log('Saving: ', notes.length)
		for (var i = 0; i < notes.length; i++) {
			toSaveCount++
			saveIt(notes[i])
		}
	});
}
function saveIt(note) {
	chrome.storage.local.get(note.id, function (bodyObj) {
		var body = bodyObj[note.id];
		// TODO: optimise and put all notes in?

		if (operationsInMinute < 120 && operationsInHour < 1800) { 
			var toSave = {};
			toSave[note.id] = body;
			sync(toSave);

			note.changed = false;
			note.date = Date.now();

			localIndex[note.id] = note;
			toSaveCount--;
			if (!toSaveCount) {
				sync({'index': localIndex})
				chrome.storage.local.set({'index': localIndex})
			}
			return;
		}
	})
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