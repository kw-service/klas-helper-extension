var internalPathFunctions = undefined
if (typeof browser === "undefined") {
  var browser = chrome;
}

// JavaScript 파일 캐시 문제 해결
function jsCache(filePath) {
  const nowDate = new Date();
  const cacheValue = nowDate.getYear() + nowDate.getMonth() + nowDate.getDay() + nowDate.getHours() + nowDate.getMinutes();
  return filePath + '?v=' + cacheValue;
}

(async () => {
  const src = chrome.runtime.getURL("core/internal-video.js");
  const scriptElement = document.createElement('script');
  scriptElement.src = src;
  document.body.appendChild(scriptElement);
})();

