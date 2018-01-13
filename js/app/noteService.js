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
				chrome.storage.local.get('index', function (local) {
					localIndex = local.index;
					if (!localIndex) {localIndex = {};}
					if (note.newTitle) {
						note.title = note.newTitle;
						note.newTitle = '';
					}
					note.new = false;
					note.date = new Date();
					
					localIndex[note.id] = {
						"id":note.id,
						"title":note.title,
						"date":note.date,
						"active":note.active,
						"changed":true
					};
					
					chrome.storage.local.set({'index': localIndex})
					
					var toStore = {};
					toStore[note.id] = note.body;
					chrome.storage.local.set(toStore)
					if (callback) {
						callback();
					}
				});
			}
			return note;
		},
		exportNotes: function() {
			chrome.storage.local.get('index', function (index) {
				var toExport = [];
				var length = 0;
				index = index.index;
				
				for (id in index) {
					length += 1;
				}
				for(id in index) {
					(function(id) {
						chrome.storage.sync.get(id, function(body){
							toExport.push({
								'id': id,
								'date': new Date(index[id].date).toISOString(),
								'title': index[id].title,
								'body': body[id]
							});
							
							if (toExport.length == length) {
								var csv = Papa.unparse(toExport);

								var a = document.createElement("a");
								document.body.appendChild(a);
								a.style = "display: none";
								var blob = new Blob([csv], {type: "text/csv"}),
									url = window.URL.createObjectURL(blob);
								a.href = url;
								a.download =  'Nopad Notes - Exported - '+new Date()+'.csv';
								a.click();
								window.URL.revokeObjectURL(url);							
							}
						})
					})(id);
				}
			})
		},
		importNotes: function (file, callback) {
			if (file && file.name.split('.').pop() === 'csv') {
				var reader = new FileReader();
				var self = this;
				reader.onload = function(e) {
					var parsed = Papa.parse(reader.result, {header: true});
					var rawNotes = parsed.data;
					
				  	if (rawNotes.length > 0) {
						// TODO: Make background saving function to prevent max operations and increase efficiency 
						if (rawNotes.length < 50) { 
							angular.forEach(rawNotes, function (rawNote) {
								var note = self.newNote(rawNote.title, rawNote.body, new Date(rawNote.date), rawNote.id);
								note.save(function() {
									background.saveLocalToSync()
									callback();
								});
							});
						}
				  	}
				};

				reader.readAsText(file);
			}
			else {
				// failed
			}
		}
	}
});