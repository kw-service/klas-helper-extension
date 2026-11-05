import { browser } from './core/browser';

/** app.js(src/utils/unscheduledLectures.ts)와 같은 값을 사용해야 합니다 */
const PREFERRED_YEARHAKGI_KEY = 'klasHelper.preferredYearhakgi';
const TIMETABLE_HIDE_STYLE_ID = 'klas-helper-timetable-hide';

/**
 * 홈 화면에서 KLAS가 먼저 그리는 학기(예: 1학기)가 잠깐 보였다가
 * 확장 프로그램이 추가한 학기(예: 현장실습 2학기)로 바뀌는 깜빡임을 막습니다.
 * 지난 방문에서 가상 학기를 기본으로 보여 줬다면 시간표 영역을 잠시 숨기고,
 * app.js가 준비되면 다시 보이게 합니다. 만약을 위해 일정 시간 뒤에는 무조건 보이게 합니다.
 */
function hideTimetableUntilReady() {
  if (location.pathname !== '/std/cmn/frame/Frame.do') {
    return;
  }

  try {
    if (!localStorage.getItem(PREFERRED_YEARHAKGI_KEY)) {
      return;
    }
  }
  catch (e) {
    return;
  }

  const style = document.createElement('style');
  style.id = TIMETABLE_HIDE_STYLE_ID;
  style.textContent = '#appModule .scheduletitle, #appModule .schedule { visibility: hidden; }';
  (document.head || document.documentElement).appendChild(style);

  setTimeout(() => {
    document.getElementById(TIMETABLE_HIDE_STYLE_ID)?.remove();
  }, 5000);
}

function main() {
  hideTimetableUntilReady();

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

            //   이미지 클릭 시 원본 보기
            document.addEventListener('click', function (event) {
              if (event.target instanceof HTMLImageElement) {
                if (event.target.tagName === 'IMG' && event.target.closest('p')) {
                  event.preventDefault();
                  imgClick(event.target);
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

/**
 * @param {HTMLImageElement} img 클릭한 이미지 element
 * @description 이미지 클릭 시 새 탭에 원본 이미지를 출력해 주는 함수
 */
function imgClick(img: HTMLImageElement) {
  let win = window.open('') as Window;
  if (!win) {
    return;
  }

  win.document.title = '이미지 원본 보기';
  let close_btn = document.createElement('button');
  close_btn.id = 'close';
  close_btn.innerText = '이미지 닫기 Close image';
  close_btn.style.width = '100%';
  close_btn.style.height = '5%';
  close_btn.style.marginBottom = '5px';
  close_btn.style.fontSize = '2.5vh';
  close_btn.style.backgroundColor = '#666666';
  close_btn.style.color = '#ffffff';
  close_btn.style.border = '1px solid #666';
  close_btn.style.borderBottom = '1px solid #555';
  close_btn.style.borderRight = '1px solid #5b5b5b';
  close_btn.style.cursor = 'pointer';
  win.document.body.appendChild(close_btn);

  let imgView = win.document.createElement('img');
  imgView.src = img.src;
  imgView.alt = 'show-img-original';
  win.document.body.appendChild(imgView);

  win.document.getElementById('close')?.addEventListener('click', () => win.close());
}
