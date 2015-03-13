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
				});
			}
			return note;
		},
		exportNotes: function() {
			chrome.storage.local.get('index', function (index) {
				var csv = "title,date,body,id\n";
				var toExport = [];
				var length = 0;
				index = index.index;
				
				for (id in index) {
					length += 1;
				}
				for(id in index) {
					chrome.storage.local.get(id, function(body){
						toExport.push(body);
						csv += (index[id].title + ',' + index[id].date + ',' + body[id] + ',' + id + '\n')
						
						if (toExport.length == length) {
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
				}
			})
		},
		importNotes: function (file) {
			if (file && file.name.split('.').pop() === 'csv') {
				var reader = new FileReader();

				reader.onload = function(e) {
				  	var rawNotes = reader.result.split('\n');
				  	console.log('raw', rawNotes);

				  	if (rawNotes.length > 0) {
						if (rawNotes[0] === 'title,date,body,id') {
							rawNotes.splice(0,1);
						}
						// TODO: Make background saving function to prevent max operations and increase efficiency 
						if (rawNotes.length < 20) { 
							angular.forEach(rawNotes, function (rawNote) {
								var parts = rawNote.split(',');
								var note = this.newNote(parts[0], parts[2], new Date(parts[1]), parts[3]);
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