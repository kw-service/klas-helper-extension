if (typeof browser === "undefined") {
     var browser = chrome;
}

const activeBtn = document.querySelector(".toggle-btn-active");
const debugBtn = document.querySelector(".toggle-btn-debug");
browser.storage.sync.get(null, function(items) {
    // Toggle button not supprted in Firefox
    if (items == undefined) {
        document.querySelector(".support-alert").innerText = `
            해당 브라우저에서는 KLAS Helper 기능을 끌 수 없습니다.
        `
        activeBtn.checked = true;
        return;
    } else if (items.currentState === undefined) {
        browser.storage.sync.set({currentState: "ON"});
        activeBtn.checked = true;
    } else if (items.currentState === "OFF") {
        activeBtn.checked = false;
    } else if (items.currentState === "ON") {
        activeBtn.checked = true;
    }

    if (items.useDebug === undefined) {
        browser.storage.sync.set({useDebug: "OFF"});
    } else if (items.useDebug === "OFF") {
        debugBtn.checked = false;
    } else if (items.useDebug === "ON") {
        debugBtn.checked = true;
    }
});


activeBtn.onclick = function() {
    if (activeBtn.checked) {
        browser.storage.sync.set({currentState: "ON"});
    } else {
        browser.storage.sync.set({currentState: "OFF"});
    }
}

debugBtn.onclick = function() {
    if (debugBtn.checked) {
        browser.storage.sync.set({useDebug: "ON"});
    } else {
        browser.storage.sync.set({useDebug: "OFF"});
    }
}
