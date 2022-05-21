if (typeof browser === "undefined") {
  var browser = chrome;
}

// 태그에 삽입되지 않는 함수 목록
export const internalPathFunctions = {
  
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
          const webURI = documentXML.getElementsByTagName("web")[0].innerHTML;
          const storyIDs = [...documentXML.getElementsByTagName("story")].map(story => story.getAttribute("id"));
          const videoTitle = documentXML.getElementsByTagName("title")[0].innerHTML.replace(/(<!\[CDATA\[)|(\]\]\>)|([^a-zA-z0-9 ()]+)/g, '');
          const slideListURIs = [...storyIDs].map(storyID => `${webURI}/slide_list_${storyID}.xml?_=${Date.now()}`);
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
            console.log(videoNames[0].innerHTML);
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

          // 슬라이드 다운로드, 마찬가지로 백그라운드 이용
          browser.runtime.sendMessage({
            "action": "downloadSlide",
            "slideListURIs": slideListURIs
          }, function(response) {
            if (response.xhrs === "") {
              return;
            }
            const slideURIList = []
            for (let i = 0; i < response.xhrs.length; i++) {
              const oParser = new DOMParser();
              const documentXML = oParser.parseFromString(response.xhrs[i], "text/xml");
              for (let j = 0; j < documentXML.getElementsByTagName('slide_image_src').length; j++) {
                const slide = documentXML.getElementsByTagName('slide_image_src')[j];
                slideURIList.push(`${webURI}/${slide.getAttribute("image_uri")}`);
              }
            }
            
            // 슬라이드 다운로드 버튼 렌더링
            if (slideURIList.length === 0) {
              return;
            }
            const labelElement = document.createElement('label');
            labelElement.innerHTML = `
              <a target="_blank" class="download-slide" style="cursor: pointer; background-color: brown; padding: 10px; text-decoration: none">
                <span style="color: white; font-weight: bold">슬라이드 받기</span>
              </a>
            `;

            // "슬라이드 받기" 이벤트 핸들러 매핑
            labelElement.onclick = () => {
              // 한번만 다운로드 가능
              const downloadButton = document.getElementsByClassName("download-slide")[0]
              if (downloadButton.style.backgroundColor === "brown") {
                console.log(slideURIList);
                const imageBlobs = [];
                for (let i = 0; i < slideURIList.length; i++) {
                  browser.runtime.sendMessage({
                    "action": "downloadImage",
                    "imageURI": slideURIList[i]
                  }, async function (response) {
                    const res = await fetch(response.blob);
                    const blob = await res.blob();
                    imageBlobs.push(blob);
                    console.log(imageBlobs);
                    if (imageBlobs.length === slideURIList.length) {
                      const FileSaverSrc = chrome.runtime.getURL("assets/FileSaver.js");
                      const FileSaverLib = await import(FileSaverSrc);
                      // JSZip 로드
                      const JSZipSrc = chrome.runtime.getURL("assets/jszip.min.js");
                      const JSZipLib = await import(JSZipSrc);
                      const zip = new JSZip();
                      for (let i = 0; i < imageBlobs.length; i++) {
                        zip.file(`${videoTitle}_slide_${i + 1}.jpg`, imageBlobs[i]);
                      }
                      zip.generateAsync({ type: "blob" }).then(function (content) {
                        saveAs(content, `${videoTitle}_slide.zip`);
                      });
                      downloadButton.style.backgroundColor = "grey";
                    }
                  });
                }
              }
            }
            document.querySelector('.mvtopba > label:last-of-type').after(labelElement);
          })
            
          });

        
      }

		// 고유 번호를 받을 때까지 대기
		const waitTimer = setInterval(() => {
      const innerelem = document.querySelector("head > script:nth-child(8)").innerText.toString().includes('kwcommons.kw.ac.kr')
                        ? document.querySelector("head > script:nth-child(8)")
                        : document.querySelector("head > script:nth-child(7)");
      const videoCode = innerelem.innerText.toString().split('https://kwcommons.kw.ac.kr/em/')[1].split('"')[0];
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
	},

  // 메인 화면
  '/std/cmn/frame/Frame.do': () => {
		// 시간표 고정 렌더링
    const renderButton = () => {
      if (!document.getElementById('fix-timetable')) {
        const selectElement = document.querySelector('.scheduletitle > select')
        const buttonElement = document.createElement('button');
        buttonElement.addEventListener("click", setTimeTableIdx);
        buttonElement.innerHTML = `
          <div>시간표 고정</div>
        `;
        buttonElement.style.cssText = `
          position: absolute; left: 20px;
        `
        buttonElement.setAttribute('id', 'fix-timetable');
        buttonElement.setAttribute('class', 'btn2 btn-lightgreen');
        selectElement.before(buttonElement);
        
      }
    }
    const setTimeTableIdx = async () => {
      try {
        const selectElement = document.querySelector('.scheduletitle > select')
        const idx = selectElement.selectedIndex;
        await browser.storage.sync.set({"timeTableIdx": idx});
        alert(`시간표가 ${selectElement.options[idx].innerHTML}로 고정되었습니다.`);
        
      } catch (e) {
        alert("알 수 없는 오류가 발생했습니다.\n\n" + e);
      }
    }

    const changeTimeTable = () => {
      const element = document.getElementsByClassName("form-control")[0]
      try {
        browser.storage.sync.get(null, function(items) {
          console.log(items);
          if (items.timeTableIdx === undefined) {
            browser.storage.sync.set({"timeTableIdx": 0});
          }
          else {
            element.selectedIndex = items.timeTableIdx;
            element.dispatchEvent(new Event("change"));
          }
        });
      } catch (e) {
        ;
      }
    }
    setTimeout(() => {
      changeTimeTable();
    }, 150);
    setTimeout(() => {
      document.querySelector('.scheduletitle > select').addEventListener("change", renderButton);
    }, 200);
    
  }
};