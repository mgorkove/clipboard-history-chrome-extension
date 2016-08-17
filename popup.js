chrome.extension.sendMessage({greeting: "GetHistory"},
        function(response) {
        	// removes all of the previous history items 
        	var body = document.getElementById("parentCH");
        	var div = document.getElementById("clipHistory");
        	body.removeChild(div);

        	// creates new div elem for updated history 
        	var newDiv = document.createElement("DIV");  
        	newDiv.id = "clipHistory"; 
        	newDiv.style = "width:100px"; 
        	document.getElementById("parentCH").appendChild(newDiv);

        	// prints all items in history to popup
        	for (var i = 0; i<response.NUM_COPIED_ITEMS_STORED; i++) {
        		if (response.history[i] != undefined) {
        			var histElem = document.createElement("DIV");  
        			histElem.innerText = response.history[i]; 
        			histElem.style = "width:100px"; 
        			document.getElementById("clipHistory").appendChild(histElem);
        			var space = document.createElement("BR"); 
        			document.getElementById("clipHistory").appendChild(space);
        		}
        		
        	}
        }
);