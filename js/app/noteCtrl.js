Nopad.controller("noteCtrl", function ($scope, $interval, $timeout, noteService) {
	var background = chrome.extension.getBackgroundPage();
	$scope.notes = [];
	$scope.noteService = noteService;
	$scope.autoSave = {};
		
	// Functions
	$scope.changed = function (note) {
		note.changed = true;
		$timeout.cancel($scope.autoSave[note.id]);	
		
		$scope.autoSave[note.id] = $timeout(function() {
			$scope.autoSave[note.id] = null;
			note.editingTitle = false;
			if (note.newTitle) {
				$scope.saveTitle(note);
			}
			else {
				note.save();
			}
		}, 2000);
	}
	
	// Enter to save note title
	$scope.changeTitle = function (note, event) {
		if (event) {
			if (event.which == '13') {
				$scope.autoSave[note.id] = null;
				note.editingTitle = false;
				if (note.newTitle) {
					note.title = note.newTitle;
				}
				note.save();
			}
		}
	}
	
	$scope.saveTitle = function (note) {
		note.editingTitle = false;
		if (note.newTitle) {
			note.title = note.newTitle;
		}
			
		note.save();
	}
	
	$scope.cancelTitle = function (note) {
		note.newTitle = null;
		note.editingTitle = false;
	}
	
	$scope.changeNote = function (note) {
		if ($scope.activeNote) {
			$scope.activeNote.editingTitle = false;
			// Save existing note first
			if ($scope.activeNote.changed) {
				$scope.activeNote.save();
			}
		}
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
	
	$scope.loadNote = function(note) {
		chrome.storage.sync.get(note.id, function(body){
			note.body = body[note.id];
			$scope.activeNote = note;
			note.active = true

			angular.forEach($scope.notes, function (n) {
				n.active = (n.id == note.id);
			})
			// Add listener to save on close
			addEventListener("unload", function (event) {
				background.saveOnClose(note);
				$scope.activeNote.save();
			}, true);
			
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
				
				if (note.active) {
					$scope.loadNote(note);
					foundActive = true;
				}
			}
			if (!foundActive) {
				if ($scope.notes.length > 0) {
					$scope.loadNote($scope.notes[0]);
				}
				else {
					$scope.newNote();
				}
			}
			$scope.$apply();
		});

	};
	
	$scope.deleteNote = function (note) {
		if (note.active) {
			$scope.activeNote = null;
		}
	
		chrome.storage.sync.get('index', function (syncIndex) {
			syncIndex = syncIndex.index;
			$timeout.cancel($scope.autoSave[note.id]);	
			
			delete syncIndex[note.id];
			
			chrome.storage.local.set({'index': syncIndex}, function() {
				chrome.storage.sync.set({'index': syncIndex}, function() {
					chrome.storage.local.remove(note.id, function() {			
						chrome.storage.sync.remove(note.id, function() {			
							$scope.loadNotes();
							$scope.$apply();
						});
					});
				});
			});
		});
	}
	
	$scope.newNote = function () { 
		$scope.activeNote = noteService.newNote('New Note', '', '', '', true);
		$scope.activeNote.save($scope.loadNotes);
	}
	
	$scope.editTitle = function (note) {
		
		note.newTitle = note.title;
		note.editingTitle = true;
		console.log('Editing title: ', note.editingTitle, note.active)
	}
	
	$scope.loadNotes();
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
			
			note.save = function (callback) {
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
					
					
					// Inactivate others
					//for (i in syncIndex) {syncIndex[i].active = false;}
					syncIndex[note.id] = {"id":note.id,"title":note.title,"date":note.date,"active":note.active};
					
					chrome.storage.local.set({'index': syncIndex})
					chrome.storage.sync.set({'index': syncIndex})
					
					
					// Save note
					var toStore = {};
					toStore[note.id] = note.body;
					chrome.storage.local.set(toStore)
					chrome.storage.sync.set(toStore, function() {
						if (callback) {
							callback();
						}
					})

					
				});
			}
			return note;
		}
	}
});
var background = chrome.extension.getBackgroundPage()



console.log(background.saveOnClose)
