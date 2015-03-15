Nopad.controller("noteCtrl", function ($scope, $interval, $timeout, noteService,focus) {
	var background = chrome.extension.getBackgroundPage();
	$scope.notes = [];
	$scope.noteService = noteService;
	$scope.autoSave = {};
	
	// Minute timer
	function resetFilterTimers() {
		// Second timer to update fitlers
		$interval.cancel($scope.updateSeconds);
		$interval.cancel($scope.updateMinutes);
		$scope.updateSeconds = $interval(function() {$scope.$apply(); }, 1000, 60);
		$scope.updateMinutes = $interval(function() {$scope.$apply(); }, 60000, 60);
	}

	// Functions
	$scope.changed = function (note) {
		$scope.activeNote.save();
		$timeout.cancel($scope.autoSave);	
		$scope.autoSave = $timeout(function() {
			if (note.newTitle) {
				$scope.saveTitle(note);
			}
			background.saveLocalToSync();
			$scope.$apply();
		}, 2000);
		resetFilterTimers();
	}
	
	// Enter to save note title
	$scope.changeTitle = function (note, event) {
		if (event) {
			if (event.which == '13') {
				$scope.saveTitle(note);
				resetFilterTimers();
			}
		}
	}
	
	$scope.saveTitle = function (note) {
		note.editingTitle = false;
		if (note.newTitle) {
			note.title = note.newTitle;
		}
		focus('body');
		note.save();
		background.saveLocalToSync();

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
			
			for (var id in syncIndex) {
				syncIndex[id].active = (id == note.id);
			}
			// Save new active
			chrome.storage.local.set({'index': syncIndex})
			// Get body
			chrome.storage.sync.get(note.id, function(body){
				note.body = body[note.id];
				console.log('loading: ',note)
				focus('body');

				// Add listener to save on close
				addEventListener("unload", function (event) {
					background.saveOnClose(note);
					$scope.activeNote.save();
				}, true);

				$scope.activeNote = note;
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
				console.log('Loading: ', syncIndex[i])
				var note = noteService.newNote(syncIndex[i].title, null, new Date(syncIndex[i].date), i, syncIndex[i].active)
				$scope.notes.push(note);
				
				if (note.active) {
					$scope.changeNote(note);
					foundActive = true;
				}
			}
			if (!foundActive) {
				if ($scope.notes.length > 0) {
					$scope.changeNote($scope.notes[0]);
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
						});
					});
				});
			});
		});
	}
	
	$scope.newNote = function () { 
		var note = noteService.newNote('New Note', '', '', '', true);
		$scope.notes.push(note);
		$scope.activeNote = note;
		$scope.activeNote.save();
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


