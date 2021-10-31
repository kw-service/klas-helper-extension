
var toggleBtn = document.querySelector(".toggle-btn");
chrome.storage.sync.get("currentState", function(items) {
    // Toggle button not supprted in Firefox
    if (items == undefined) {
        document.querySelector(".support-alert").innerText = `
            해당 브라우저에서는 KLAS Helper 기능을 끌 수 없습니다.
        `
        toggleBtn.checked = true;
    } else if (items.currentState === undefined) {
        chrome.storage.sync.set({currentState: "ON"});
        toggleBtn.checked = true;
    } else if (items.currentState === "OFF") {
        toggleBtn.checked = false;
    } else if (items.currentState === "ON") {
        toggleBtn.checked = true;
    }
});


toggleBtn.onclick = function() {
    console.log(toggleBtn.checked);
    if (toggleBtn.checked) {
        chrome.storage.sync.set({currentState: "ON"});
    } else {
        chrome.storage.sync.set({currentState: "OFF"});
    }
}
