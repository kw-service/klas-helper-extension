import { browser } from './core/browser';
var internalPathFunctions = undefined;

// JavaScript 파일 캐시 문제 해결
function jsCache(filePath: String) {
  const nowDate = new Date();
  const cacheValue = nowDate.getFullYear() + nowDate.getMonth() + nowDate.getDay() + nowDate.getHours() + nowDate.getMinutes();
  return filePath + '?v=' + cacheValue;
}

(async () => {
  const src = browser.runtime.getURL('video-viewer.js');
  const scriptElement = document.createElement('script');
  scriptElement.src = src;
  document.body.appendChild(scriptElement);
})();
