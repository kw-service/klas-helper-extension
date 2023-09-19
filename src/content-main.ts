import { browser } from './core/browser';
import { internalPathFunctions } from './internal';

// JavaScript 파일 캐시 문제 해결
function jsCache(filePath: string) {
  const nowDate = new Date();
  const cacheValue = nowDate.getFullYear() + nowDate.getMonth() + nowDate.getDay() + nowDate.getHours() + nowDate.getMinutes();
  return filePath + '?v=' + cacheValue;
}

(async () => {
  // 크롬 sync 스토리지 이용해 체크 여부 확인
  try {
    browser.storage.sync.get('currentState', function (items) {
      // chrome namespace not supported
      if (items === undefined) {
        main();
      }
      else if (items.currentState === undefined) {
        browser.storage.sync.set({ 'currentState': 'ON' });
        main();
      }
      else if (items.currentState === 'ON') {
        main();
      }
    });
  }
  catch (e) {
    main();
  }
})();

async function main() {
  'use strict';
  const waitTimer = setInterval(() => {
    if (document.querySelector('.navtxt span:nth-child(1)')) {
      if (document.querySelector('.navtxt span:nth-child(2)')) {
        document.querySelector('.navtxt span:nth-child(2)')!.remove();
        document.querySelector('.navtxt span:nth-child(1)')!.innerHTML = (`
        <a href="https://github.com/klas-helper/klas-helper-extension/wiki/%EA%B8%B0%EC%A1%B4-KLAS-Helper-Tempermonkey-%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-%EC%82%AD%EC%A0%9C-%EB%B0%A9%EB%B2%95"
          target="_blank" rel="noopener" style="color: red; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;">
            기존 스크립트를 삭제해 주세요! (클릭) 
        </a>
        `);
      }
      else {
        document.querySelector('.navtxt span:nth-child(1)')!.innerHTML = (`
        <a href="https://github.com/klas-helper/klas-helper" target="_blank" rel="noopener">KLAS Helper</a>
        <a href="https://github.com/klas-helper/klas-helper-extension" target="_blank" rel="noopener">확장 프로그램</a>
        사용 중
        `);
      }
      clearInterval(waitTimer);
    }
  }, 500);

  // 메인 파일 삽입
  const scriptElements = [];
  const appJs = browser.runtime.getURL('app.js');
  const appCss = browser.runtime.getURL('app.css');
  let ChartJs = browser.runtime.getURL('assets/js/Chart.min.js');
  let jQueryModalJs = browser.runtime.getURL('assets/js/jquery.modal.min.js');
  let jQueryModalCss = browser.runtime.getURL('assets/css/jquery.modal.min.css');

  const appJsScriptElement = document.createElement('script');
  let chartJsScriptElements = document.createElement('script');
  let jQueryModalJsScriptElements = document.createElement('script');
  let jQueryModalCssScriptElements = document.createElement('link');

  appJsScriptElement.src = jsCache(appJs);
  chartJsScriptElements.src = jsCache(ChartJs);
  jQueryModalJsScriptElements.src = jsCache(jQueryModalJs);
  jQueryModalCssScriptElements.href = jsCache(jQueryModalCss);
  jQueryModalCssScriptElements.rel = 'stylesheet';
  jQueryModalCssScriptElements.type = 'text/css';

  const appCssLinkElement = document.createElement('link');
  appCssLinkElement.href = appCss;
  appCssLinkElement.rel = 'stylesheet';
  appCssLinkElement.type = 'text/css';

  scriptElements.push(appJsScriptElement);
  scriptElements.push(appCssLinkElement);
  scriptElements.push(chartJsScriptElements);
  scriptElements.push(jQueryModalJsScriptElements);
  scriptElements.push(jQueryModalCssScriptElements);

  // document.head.appendChild(scriptElement);
  let useTempermonkey = false;
  for (let i = 0; i < document.head.children.length; i++) {
    if ((document.head.children[i] as any).src !== undefined) {
      if ((document.head.children[i] as any).src.includes('https://klas-helper.github.io/klas-helper/dist/main.js')) {
        console.log('Detect tempermonkey script!');
        useTempermonkey = true;
        break;
      }
    }
  }

  if (!useTempermonkey) {
    for (const element in scriptElements) {
      document.head.appendChild(scriptElements[element]);
    }
    // document.head.appendChild(scriptElement);
    for (const path in internalPathFunctions) {
      if (path === location.pathname) {
        (internalPathFunctions as any)[path]();
      }
    }
  }

  // 일정 시간이 지날 경우 타이머 해제
  setTimeout(() => {
    clearInterval(waitTimer);
  }, 1500);
}
