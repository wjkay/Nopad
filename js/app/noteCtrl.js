Nopad.controller("noteCtrl", function ($scope, $interval, $timeout, noteService,focus) {
	var background = chrome.extension.getBackgroundPage();
	$scope.notes = [];
	$scope.noteService = noteService;
	$scope.autoSave = {};
		
	// Functions
	$scope.changed = function (note) {
		$scope.activeNote.save();
		$timeout.cancel($scope.autoSave);	
		$scope.autoSave = $timeout(function() {
			if (note.newTitle) {
				$scope.saveTitle(note);
			}
			background.saveLocalToSync();
		}, 2000);
	}
	
	// Enter to save note title
	$scope.changeTitle = function (note, event) {
		if (event) {
			if (event.which == '13') {
				$scope.autoSave[note.id] = null;
				$scope.saveTitle(note);
			}
		}
	}
	
	$scope.saveTitle = function (note) {
		note.editingTitle = false;
		if (note.newTitle) {
			note.title = note.newTitle;
		}
		console.log('Focus body')
		focus('body');
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
		}
		// Update active index
		chrome.storage.local.get('index', function (syncIndex) {
			syncIndex = syncIndex.index
			
			for (i in syncIndex) {
				syncIndex[i].active = false;
				if (note.id == i) {
					syncIndex[i].active = true;
				}
			}
			chrome.storage.local.set({'index': syncIndex})
			$scope.loadNote(note);
			focus('body');
		});
	}
	
	$scope.loadNote = function(note) {
		chrome.storage.local.get(note.id, function(body){
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
			chrome.storage.local.get('index', function (syncIndex) {
				syncIndex = syncIndex.index
				
				for (i in syncIndex) {
					syncIndex[i].active = false;
					if (note.id == i) {
						syncIndex[i].active = true;
					}
				}
				chrome.storage.local.set({'index': syncIndex})
				$scope.$apply();
			});
		});
	};
	
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
		var note = noteService.newNote('New Note', '', '', '', true);
		$scope.changeNote(note);
		$scope.notes.push(note);
		$scope.activeNote = note;
		$scope.changed($scope.activeNote);
		$scope.editTitle($scope.activeNote);
	}
	
	$scope.editTitle = function (note) {
		note.newTitle = note.title;
		note.editingTitle = true;
		focus(note.id);
	}
	
	$scope.exportNotes = function () {
		noteService.exportNotes();
	}

	$scope.importNotes = function () {
		document.getElementById('importInput').click();
	}
	document.getElementById('importInput').addEventListener('change', function (e) {
		noteService.importNotes(e.target.files[0]); 
	});
	
	$scope.loadNotes();
});


