Nopad.controller("noteCtrl", function ($scope, $interval, $timeout, noteService, config, focus) {
	var background = chrome.extension.getBackgroundPage();
	$scope.notes = [];
	$scope.noteService = noteService;
	$scope.autoSave = {};

	$scope.config = config;
	$scope.config.init();

	// Minute timer for updating ui
	resetFilterTimers();
	function resetFilterTimers() {
		// Second timer to update fitlers
		$interval.cancel($scope.updateSeconds);
		$interval.cancel($scope.updateMinutes);
		$scope.updateSeconds = $interval(function() { }, 1000, 60);
		$scope.updateMinutes = $interval(function() { }, 60000, 60);
	}

	// Order the notes
	$scope.predicate = 'date';
	$scope.reorder = function(prop) {
		if ($scope.predicate && $scope.predicate == prop) {
			$scope.reverse = !$scope.reverse;
		}
		$scope.predicate = prop;
		var direction = '';
		if ($scope.reverse) {
			direction = '-';
		}
		$scope.orderbyProp = direction + prop;
	}
	$scope.reorder('date');


	$scope.changed = function (note) {
		$scope.activeNote.save();
		$timeout.cancel($scope.autoSave);	
		$scope.autoSave = $timeout(function() {
			background.saveLocalToSync();
			$scope.$apply();
		}, 2000);
		resetFilterTimers();
	}
	
	$scope.changeNote = function (note, dontFocus) {
		// Update active index
		chrome.storage.local.get('index', function (syncIndex) {
			syncIndex = syncIndex.index
			
			for (var id in syncIndex) {
				syncIndex[id].active = (id == note.id);
			}
			
			// Get body
			chrome.storage.sync.get(note.id, function(body){
				note.body = body[note.id];
				if (!dontFocus){
					focus('body');
				}
				// Add listener to save on close
				addEventListener("unload", function (event) {
					background.saveOnClose(note);
					$scope.activeNote.save();
				}, true);
				if($scope.activeNote)
					$scope.activeNote.active = false;
				$scope.activeNote = note;
				$scope.activeNote.titleCheck = note.title;
				$scope.activeNote.active = true;
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
		// Focus to title
		focus(note.id);
	}

	$scope.exportNotes = function () {
		noteService.exportNotes();
	}

	$scope.importNotes = function () {
		var el = document.getElementById('importInput');
		el.type = '';
		el.type = 'file';
		el.click();
	}
	document.getElementById('importInput').addEventListener('change', function (e) {
		noteService.importNotes(e.target.files[0], $scope.loadNotes); 
	});
	
	$scope.loadNotes();
});


