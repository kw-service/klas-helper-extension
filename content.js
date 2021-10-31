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
			chrome.runtime.sendMessage({
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



function main() {
	'use strict';
	// 메인 파일 삽입
	// 업데이트 시 즉각적으로 업데이트를 반영하기 위해 이러한 방식을 사용함
	const scriptElement = document.createElement('script');
  // scriptElement.src = jsCache('http://localhost:8080/main-ext.js');
	scriptElement.src = jsCache('https://nbsp1221.github.io/klas-helper/dist/main.js');
	document.head.appendChild(scriptElement);
	for (const path in internalPathFunctions) {
		if (path === location.pathname) {
		  internalPathFunctions[path]();
		}
	}

  const waitTimer = setInterval(() => {
    if (document.querySelector('.navtxt span:nth-child(1)')) {
      document.querySelector('.navtxt span:nth-child(1)').innerHTML  = (`
      <span style="margin-right: 20px">
        <a href="https://github.com/nbsp1221/klas-helper" target="_blank" rel="noopener">KLAS Helper</a>
        <a href="https://github.com/mirusu400/klas-helper-extension" target="_blank" rel="noopener">확장 프로그램</a>
        사용 중
      </span>
    `);
      clearInterval(waitTimer);
    }
  }, 100);

  // 일정 시간이 지날 경우 타이머 해제
  setTimeout(() => {
    clearInterval(waitTimer);
  }, 1500);
}

// 크롬 sync 스토리지 이용해 체크 여부 확인
try {
  chrome.storage.sync.get("currentState", function(items) {
    // chrome namespace not supported
    if (items === undefined) {
      main();
    }
    else if (items.currentState === undefined) {
      chrome.storage.sync.set({"currentState": "ON"});
      main();
    }
    else if (items.currentState === "ON") {
      main();
    }
  });
} catch (e) {
  main();
}