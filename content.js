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
  const src = browser.runtime.getURL("core/internal.js");
  const content = await import(src);
  internalPathFunctions = content.internalPathFunctions;

  // 크롬 sync 스토리지 이용해 체크 여부 확인
  try {
    browser.storage.sync.get("currentState", function(items) {
      // chrome namespace not supported
      if (items === undefined) {
        main();
      }
      else if (items.currentState === undefined) {
        browser.storage.sync.set({"currentState": "ON"});
        main();
      }
      else if (items.currentState === "ON") {
        main();
      }
    });
  } catch (e) {
    main();
  }
})();

async function main() {
	'use strict';
  const waitTimer = setInterval(() => {
    if (document.querySelector('.navtxt span:nth-child(1)')) {
      if (document.querySelector('.navtxt span:nth-child(2)')) {
        document.querySelector('.navtxt span:nth-child(2)').remove();
        document.querySelector('.navtxt span:nth-child(1)').innerHTML  = (`
        <a href="https://github.com/klas-helper/klas-helper-extension/wiki/%EA%B8%B0%EC%A1%B4-KLAS-Helper-Tempermonkey-%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-%EC%82%AD%EC%A0%9C-%EB%B0%A9%EB%B2%95"
          target="_blank" rel="noopener" style="color: red; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;">
            기존 스크립트를 삭제해 주세요! (클릭) 
        </a>
        `);
      } else {
        document.querySelector('.navtxt span:nth-child(1)').innerHTML  = (`
        <a href="https://github.com/klas-helper/klas-helper" target="_blank" rel="noopener">KLAS Helper</a>
        <a href="https://github.com/klas-helper/klas-helper-extension" target="_blank" rel="noopener">확장 프로그램</a>
        사용 중
        `);
      }
      clearInterval(waitTimer);
    }
  }, 500);
 
  
  
	// 메인 파일 삽입
	// 업데이트 시 즉각적으로 업데이트를 반영하기 위해 이러한 방식을 사용함
	const scriptElement = document.createElement('script');
  // let jsfile = 'https://nbsp1221.github.io/klas-helper/dist/main-ext.js';
  let jsfile = browser.runtime.getURL("core/main-ext.js");
    
  scriptElement.src = jsCache(jsfile);
  document.head.appendChild(scriptElement);
  let useTempermonkey = false;
  for (let i = 0; i < document.head.children.length; i++) {
    if (document.head.children[i].src !== undefined) {
      if (document.head.children[i].src.includes("https://klas-helper.github.io/klas-helper/dist/main.js")) {
        console.log("Detect tempermonkey script!");
        useTempermonkey = true;
        break;
      }
    }
  }

  if (!useTempermonkey) {
    document.head.appendChild(scriptElement);
    for (const path in internalPathFunctions) {
      if (path === location.pathname) {
        internalPathFunctions[path]();
      }
    }
  }
    
  
    // 일정 시간이 지날 경우 타이머 해제
  setTimeout(() => {
    clearInterval(waitTimer);
  }, 1500);
}

