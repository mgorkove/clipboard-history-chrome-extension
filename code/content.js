// listens for copy and notifies the background script if a copy occurred 
document.body.addEventListener('copy',function(){
    chrome.runtime.sendMessage({greeting: "copy occurred"}, function(response) { 
	});
});

// paste the text that the user clicked on
chrome.runtime.onMessage.addListener(
  	function(request, sender, sendResponse) {
    	document.execCommand('InsertText', false, request.greeting);
  	}
);
   

