import { browser } from './core/browser';

function main() {
  var document_observer = new MutationObserver(function (mutations) {
    // 기본 css가 important가 되기 때문에, 모든 css파일이 로드가 된 후에 추가합니다.
    // 기본적으로 추가되는 head의 child가 27개이므로 전부다 로드가 되면 해당 css를 주입합니다.
    if (document.head.childElementCount > 26) {
      // favicon 삽입
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = 'https://www.kw.ac.kr/ko/img/favicon.ico';
      document.getElementsByTagName('head')[0].appendChild(favicon);

      // 크롬 sync 스토리지 이용해 체크 여부 확인
      try {
        // dark mode 적용
        browser.storage.sync.get(null).then((items) => {
          // chrome namespace not supported
          if (items.useDark === undefined) {
            browser.storage.sync.set({ 'useDark': 'OFF' });
          }
          else if (items.useDark === 'ON') {
            //  다크모드 css 삽입
            const style = document.createElement('link');
            style.href = browser.runtime.getURL('dark.css');
            style.type = 'text/css';
            style.rel = 'stylesheet';
            document.querySelector('head')?.append(style);
          }
        }).catch((error) => {
          console.error('Error accessing storage:', error);
        });
      }
      catch (e) {

      }

      // 크롬 sync 스토리지 이용해 체크 여부 확인
      try {
        // 이미지 크기 조정 적용
        browser.storage.sync.get(null).then((items) => {
          // chrome namespace not supported
          if (items.useImgSize === undefined) {
            browser.storage.sync.set({ 'useImgSize': 'OFF' });
          }
          else if (items.useImgSize === 'ON') {
            //   이미지 크기 조정 css 삽입
            const style = document.createElement('link');
            style.href = browser.runtime.getURL('imgSize.css');
            style.type = 'text/css';
            style.rel = 'stylesheet';
            document.querySelector('head')?.append(style);

            //   이미지 클릭 시 확대
            document.addEventListener('click', function (event) {
              if (event.target instanceof HTMLImageElement) {
                if (event.target.tagName === 'IMG') {
                  event.preventDefault();

                  let win = window.open('') as Window;
                  win.document.title = '이미지 원본 보기';
                  win.document.body.innerHTML = '<div id="button"><button id="close">이미지 닫기 Close image</button></div> <div id="imgview"><img src="' + event.target.src + '" alt="show-img-big"/></div> <style>#button{width: 100%; height: 5%;} button{width: 100%; height: 90%; font-size: 2.5vh; background-color: #666666; color: #fff; border: 1px solid #666; border-bottom: 1px solid #555; border-right: 1px solid #5b5b5b; cursor: pointer;} #imgview{width: 100%; height: 95%;} img{object-fit: contain;} </style>';
                  win.document.getElementById('close')?.addEventListener('click', () => win.close());
                }
              }
            }, true);
          }
        }).catch((error) => {
          console.error('Error accessing storage:', error);
        });
      }
      catch (e) {

      }

      document_observer.disconnect();
    }
  });

  document_observer.observe(document, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}

// 크롬 sync 스토리지 이용해 체크 여부 확인
try {
  browser.storage.sync.get('currentState').then((items) => {
    // chrome namespace not supported
    if (items === undefined || Object.keys(items).length === 0) {
      main();
    }
    else if (items.currentState === undefined) {
      browser.storage.sync.set({ 'currentState': 'ON' });
      main();
    }
    else if (items.currentState === 'ON') {
      main();
    }
  }).catch((error) => {
    console.error('Error accessing storage:', error);
    main();
  });
}
catch (e) {
  main();
}

