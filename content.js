if (typeof browser === "undefined") {
  var browser = chrome;
}

// JavaScript 파일 캐시 문제 해결
function jsCache(filePath) {
	const nowDate = new Date();
	const cacheValue = nowDate.getYear() + nowDate.getMonth() + nowDate.getDay() + nowDate.getHours() + nowDate.getMinutes();
	return filePath + '?v=' + cacheValue;
}


// 태그에 삽입되지 않는 함수 목록
const internalPathFunctions = {
	// 온라인 강의 화면
	'/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do': () => {
		// 온라인 강의 동영상 다운로드
		const downloadVideo = (videoCode) => {
      // CORS 허용을 위해 백그라운드로 관련 데이터를 보내고, 받아온 데이터로 렌더링을 진행합니다.
			browser.runtime.sendMessage({
					"action": "downloadVideo",
					"videoCode": videoCode
				}, function (response) {
          const oParser = new DOMParser();
          const documentXML  = oParser.parseFromString(response.xhr, "text/xml");
          const videoList = [];

          // 분할된 동영상 등 다양한 상황 처리
          if (documentXML.getElementsByTagName('desktop').length > 0) {
            videoList.push({
              url: documentXML.getElementsByTagName('media_uri')[0].innerHTML,
              type: documentXML.getElementsByTagName('content_type')[0].innerHTML
            });
          }
          else {
            const mediaURI = documentXML.getElementsByTagName('media_uri')[0].innerHTML;
            const videoNames = documentXML.getElementsByTagName('main_media');
            const videoTypes = documentXML.getElementsByTagName('story_type');

            for (let i = 0; i < videoNames.length; i++) {
              videoList.push({
                url: mediaURI.replace('[MEDIA_FILE]', videoNames[i].innerHTML),
                type: videoTypes[i].innerHTML
              });
            }
          }

          // 다운로드 버튼 렌더링
          for (let i = 0; i < videoList.length; i++) {
            const videoURL = videoList[i].url;
            const videoType = videoList[i].type === 'video1' ? '동영상' : '오디오';

            const labelElement = document.createElement('label');
            labelElement.innerHTML = `
              <a href="${videoURL}" target="_blank" style="background-color: brown; padding: 10px; text-decoration: none">
                <span style="color: white; font-weight: bold">${videoType} 받기 #${i + 1}</span>
              </a>
            `;
            document.querySelector('.mvtopba > label:last-of-type').after(labelElement);
          }
        }
      );
		};

		// 고유 번호를 받을 때까지 대기
		const waitTimer = setInterval(() => {
      const videoCode = document.querySelector("head > script:nth-child(8)").innerText.toString().split('https://kwcommons.kw.ac.kr/em/')[1].split('"')[0];
      document.body.setAttribute('data-video-code', videoCode);
			if (videoCode) {
				clearInterval(waitTimer);
				downloadVideo(videoCode);
			}
		}, 100);

		// 일정 시간이 지날 경우 타이머 해제
		setTimeout(() => {
			clearInterval(waitTimer);
		}, 10000);
	}
};



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
  await browser.storage.sync.get(null, function(items) {
    // Toggle button not supprted in Firefox
    if (items !== undefined) {
      if (items.useBeta === undefined || items.useBeta === "OFF") {
        browser.storage.sync.set({"useBeta": "OFF"});
      }
      if (items.useBeta === "ON") {
        jsfile = 'https://klas-helper.github.io/klas-helper/dist/main-ext.js';
      }
    }
  });

  await browser.storage.sync.get(null, function(items) {
    // chrome namespace not supported
    if (items !== undefined) {
      if (items.useDebug === undefined || items.useDebug === "OFF") {
        browser.storage.sync.set({"useDebug": "OFF"});
      }
      else if (items.useDebug === "ON") {
        jsfile = 'http://localhost:8080/main-ext.js';
      }
    }
    
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
  });
}

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
