if (typeof browser === "undefined") {
     var browser = chrome;
}

const activeBtn = document.querySelector(".toggle-btn-active");
const darkBtn = document.querySelector(".toggle-btn-dark");
const debugBtn = document.querySelector(".toggle-btn-debug");
const betaBtn = document.querySelector(".toggle-btn-beta");

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
        chrome.runtime.sendMessage({
            action: 'updateIcon',
            value: "enabled"
        });
        activeBtn.checked = true;
    } else if (items.currentState === "OFF") {
        chrome.runtime.sendMessage({
            action: 'updateIcon',
            value: "disabled"
        });
        activeBtn.checked = false;
    } else if (items.currentState === "ON") {
        chrome.runtime.sendMessage({
            action: 'updateIcon',
            value: "enabled"
        });
        activeBtn.checked = true;
    }

    // 다크테마 여부
    if (items.useDark === undefined) {
        browser.storage.sync.set({useDark: "OFF"});
    } else if (items.useDark === "OFF") {
        darkBtn.checked = false;
    } else if (items.useDark === "ON") {
        darkBtn.checked = true;
    }
});


activeBtn.onclick = function() {
    if (activeBtn.checked) {
        browser.storage.sync.set({currentState: "ON"});
        chrome.runtime.sendMessage({
            action: 'updateIcon',
            value: "enabled"
        });
    } else {
        browser.storage.sync.set({currentState: "OFF"});
        chrome.runtime.sendMessage({
            action: 'updateIcon',
            value: "disabled"
        });
    }
}


darkBtn.onclick = function() {
    if (darkBtn.checked) {
        browser.storage.sync.set({useDark: "ON"});
    } else {
        browser.storage.sync.set({useDark: "OFF"});
    }
}

const manifestData = browser.runtime.getManifest();
const versionElement = document.querySelector(".version");
versionElement.innerText = `v${manifestData.version}`;