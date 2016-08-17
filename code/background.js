// issues: does not work in chrome search bar or docs because 
// a different context menu pops up for that 
// in docs or search bar, can click on browser event 
// and copy and paste an item from history manually 

var parent = chrome.contextMenus.create({"title": "Paste from clipboard history", "contexts": ["all"]});

var NUM_COPIED_ITEMS_STORED = 5;

// stores strings that are copied; default size is 5
var history = [" "," "," "," "," "]; 

// changes amount of items stored in history
function changeHistorySize(id) {
    var num = -1; 
    while (num < 0 || isNaN(num) || num == "") {
       num = prompt("How many items do you want to be stored in your clipboard history?");
    }
    if (num != null) {
        var newHistory = []; 
        for (var i = 0; i<num; i++) {
            if (i < NUM_COPIED_ITEMS_STORED) {
                newHistory.push(history[i]); 
            } else {
                newHistory.push(" ");
                var ID = String(i); 
                var clip1 = chrome.contextMenus.create({"id": ID, "title": " ", "contexts": ["all"], "parentId": parent, "onclick": pasteFromHistory});
            }
        }
        if (num < NUM_COPIED_ITEMS_STORED) {
            for (var i = num; i<NUM_COPIED_ITEMS_STORED; i++) chrome.contextMenus.remove(String(i));  // remove remaining context menu elems 
        }
        history = newHistory; 
        NUM_COPIED_ITEMS_STORED = num;     
    }
}

// parent of historySize and clear 
var settings = chrome.contextMenus.create({"id": "settings", "title": "Options", "contexts": ["all"], "parentId": parent});


// allows user to change amount of items stored in history 
var historySize = chrome.contextMenus.create({"id": "change", "title": "Change amount of items stored in history", "contexts": ["all"], "parentId": settings, "onclick": changeHistorySize});

// clears clipboard history 
function clearHist(id) {
    for (var i = 0; i<NUM_COPIED_ITEMS_STORED; i++) history[i] = " "; 
    updateHistoryMenu(); 
}
// allows user to clear clipboard history 
var clear = chrome.contextMenus.create({"id": "clear", "title": "Clear clipboard history", "contexts": ["all"], "parentId": settings, "onclick": clearHist});

// pastes the text from history that the user clicked on
function pasteFromHistory(id) {
	var index = parseInt(id.menuItemId); 
    // sends the content script what the user clicked on
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: history[index]}, function(response) {
        });
    });
}

// creates history menu 
for (var i = 0; i<NUM_COPIED_ITEMS_STORED; i++) {
	var ID = String(i); 
	var clip1 = chrome.contextMenus.create({"id": ID, "title": " ", "contexts": ["all"], "parentId": parent, "onclick": pasteFromHistory});
}

// text that's on clipboard 
var currentClipTxt = ""; 

// from user danf on http://cudou.com/pages/cigbihgg-get-current-text-from-clipboard-in-chrome-app.html
function getClipboardText() {
    var pasteDiv = document.createElement("div");
    pasteDiv.style.position = "absolute";
    pasteDiv.style.left = "-10000px";
    pasteDiv.style.top = "-10000px";
    pasteDiv.contentEditable = true;
    var insertionElement = document.activeElement; 
    var nodeName = insertionElement.nodeName.toLowerCase();
    while (nodeName !== "body" && nodeName !== "div" && nodeName !== "li" && nodeName !== "th" && nodeName !== "td") { 
        insertionElement = insertionElement.parentNode; 
        nodeName = insertionElement.nodeName.toLowerCase(); 
    }
    insertionElement.appendChild(pasteDiv);
    pasteDiv.focus();
    document.execCommand('paste');
    var clipboardText = pasteDiv.innerText;
    insertionElement.removeChild(pasteDiv);
    return clipboardText;
}

// puts newest thing copied into the history and takes out the oldest thing 
function updateHistory(currentClipTxt) {   
    var temp = history[0]; 
    var temp2; 
    for (var i = 1; i< NUM_COPIED_ITEMS_STORED; i++) {
        temp2 = history[i];
        history[i] = temp;
        temp = temp2; 
    }
    history[0] = currentClipTxt; 
}

// updates the history menu to reflect the current state of the history array 
function updateHistoryMenu() {
    for (var i = 0; i< NUM_COPIED_ITEMS_STORED; i++) {
        var ID = String(i); 
        chrome.contextMenus.update(ID, {"title": history[i]}); 
    } 
}

// listens for content script message indicating that the user copied something 
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
    if (message.greeting == "copy occurred") {
        currentClipTxt = getClipboardText(); 
        updateHistory(currentClipTxt); 
        updateHistoryMenu(); 
    } 
    if (message.greeting == "GetHistory") { 
            var historyData = {history, NUM_COPIED_ITEMS_STORED}; 
            sendResponse(historyData);
    }  
  });



