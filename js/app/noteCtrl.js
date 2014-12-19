Nopad.controller("noteCtrl", function ($scope, $interval, $timeout, noteService) {
	debugger;

	$scope.notes = [];
	$scope.noteService = noteService;
	
	// Functions
	$scope.changed = function () {
		$timeout.cancel($scope.autoSave);	
		$scope.autoSave = $timeout(function() {
			if ($scope.activeNote.title) {
				$scope.activeNote.save();
			}
		}, 1000);
	}
	
	$scope.changeNote = function (note) {
		// Update active index
		chrome.storage.sync.get('index', function (syncIndex) {
			syncIndex = syncIndex.index
			
			for (i in syncIndex) {
				syncIndex[i].active = false;
				if (note.id == i) {
					syncIndex[i].active = true;
				}
			}
			chrome.storage.local.set({'index': syncIndex})
			chrome.storage.sync.set({'index': syncIndex})
			$scope.loadNote(note);
		});
	}
	
	$scope.deleteNote = function (index) {
		// Update active index
		var note = $scope.notes[index];
		$scope.notes.splice(index, 1);
		if (note.active) {
			$scope.newNote();
		}
		chrome.storage.sync.get('index', function (syncIndex) {
			syncIndex = syncIndex.index
			
			console.log('deleted: ', note.title);
			delete syncIndex[note.id]
			
			chrome.storage.local.remove(note.id);
			chrome.storage.sync.remove(note.id);
			
			chrome.storage.local.set({'index': syncIndex})
			chrome.storage.sync.set({'index': syncIndex})
			$scope.$apply();
		});
	}
	
	$scope.deleteNotes = function () {
		chrome.storage.local.clear();
		chrome.storage.sync.clear();
	}
	
	$scope.loadNote = function(note) {
		$scope.editingTitle = false;
		chrome.storage.sync.get(note.id, function(body){
			note.body = body[note.id];
			$scope.activeNote = note;
			note.active = true

			angular.forEach($scope.notes, function (n) {
				n.active = (n.id == note.id);
			})
			
			// Update active index
			chrome.storage.sync.get('index', function (syncIndex) {
				syncIndex = syncIndex.index
				
				for (i in syncIndex) {
					syncIndex[i].active = false;
					if (note.id == i) {
						syncIndex[i].active = true;
					}
				}
				chrome.storage.local.set({'index': syncIndex})
				chrome.storage.sync.set({'index': syncIndex})
				$scope.$apply();
			});
		});
	}
	
	$scope.loadNotes = loadNotes = function() {
		$scope.notes = [];
		chrome.storage.sync.get('index', function (syncIndex) {
			syncIndex = syncIndex.index
			var foundActive = false;
			for (i in syncIndex) {
				
				var note = noteService.newNote(syncIndex[i].title, null, syncIndex[i].date, i, syncIndex[i].active)
				$scope.notes.push(note);
				if (syncIndex[i].active) {
					$scope.loadNote(syncIndex[i]);
					foundActive = true;
				}
			}
			if (!foundActive) {
				$scope.newNote();
			}
			$scope.$apply();
		});

	};
	
	//$scope.$watch('notes',function(newv, oldv) {console.log('Notes changed: ', newv, oldv)})
	
	$scope.newNote = function () { 
		$scope.activeNote = noteService.newNote();
	}
	

	
	$scope.saveNote = function (note) {
		note.save();
	}
	
	$interval(function(){}, 1000)
	
	
	// load notes
	$scope.loadNotes();
	
	
	// Function to print all keys
	//chrome.storage.sync.get(null, function(items) {
	//	var allKeys = Object.keys(items);
	//	console.log('All Sync: ',allKeys);
	//});
	
});

Nopad.service('noteService', function() {
	return {
		newNote: function (title, body, date, id, active) {
			
			var note = {};
			note.title = title;
			note.body = body;
			note.date = date;
			note.active = active;
			if (id) {
				note.id = id;
			}
			else {
				note.id = UUID.generate();
				note.new = true;
			}
			
			note.save = function (localOnly) {
				console.log('---Saving---');
				chrome.storage.sync.get('index', function (syncIndex) {
					syncIndex = syncIndex.index;
					if (!syncIndex) {syncIndex = {};}
					
					var id = note.id;
					var body = note.body;
					var title = note.title;
					var active = note.active;
					note.date = Date.now();
					note.new = false;
					
					// Inactivate others
					for (i in syncIndex) {syncIndex[i].active = false;}
					
					syncIndex[id] = {"id":id,"title":title,"date":note.date,"active":true};
					
					chrome.storage.local.set({'index': syncIndex})
					chrome.storage.sync.set({'index': syncIndex})

					// Save note
					var toStore = {};
					toStore[id] = body;
					chrome.storage.local.set(toStore)
					chrome.storage.sync.set(toStore)

					loadNotes();
				});
			}

			return note;
		},
		
		
		
		
	}
});


