if (typeof browser === "undefined") {
  var browser = chrome;
}

function asyncGetData(request) {  
  return new Promise((resolve, reject) =>{
    const _xhr = new XMLHttpRequest;
    _xhr.open("GET", 'https://kwcommons.kw.ac.kr/viewer/ssplayer/uniplayer_support/content.php?content_id=' + request.videoCode);
    _xhr.onload = () => {
        if (_xhr.status == 200) {
          resolve(_xhr);
        } else {
          resolve("")
        }
    };
    _xhr.send();
  })     
}

function asyncGetSlide(request) {
  return new Promise((resolve, reject) => {
    const _xhr = new XMLHttpRequest;
    _xhr.open("GET", request);
    _xhr.onload = () => {
      if (_xhr.status == 200) {
        resolve(_xhr);
      } else {
        resolve("")
      }
    };
    _xhr.send();
  })
}

function asyncGetImage(imageURI) {
  return new Promise((resolve, reject) => {
    const _xhr = new XMLHttpRequest;
    _xhr.responseType = 'blob';
    _xhr.open("GET", imageURI);
    _xhr.onload = () => {
      if (_xhr.status == 200) {
        resolve(_xhr);
      } else {
        resolve("")
      }
    };
    _xhr.send();
  })
}

function blobToBase64(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

// content.js 와 통신하는 백그라운드 함수
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadVideo') {
    (async () => {
      const oSerializer = new XMLSerializer();
      const xhr = await asyncGetData(request);
      const sXML = oSerializer.serializeToString(xhr.responseXML);
      sendResponse({xhr: sXML});
    })();
    return true;
  } else if (request.action === 'downloadSlide') {
    (async () => {
      const sXMLs = [];
      for (let i = 0; i < request.slideListURIs.length; i++) {
        try {
          const oSerializer = new XMLSerializer();
          const xhr = await asyncGetSlide(request.slideListURIs[i]);
          const sXML = oSerializer.serializeToString(xhr.responseXML);
          sXMLs.push(sXML);
        } catch (e) {
          console.log(e);
        }
      }
      sendResponse({ xhrs: sXMLs });
    })();
    return true;
  } else if (request.action === 'downloadImage') {
    (async () => {
      try {
        const xhr = await asyncGetImage(request.imageURI);
        const blob = new Blob([xhr.response], { type: 'image/jpeg' });
        // blob으로 넘겨주면 객체가 사라져서 Base64로 인코딩 후 건네줍니다.
        const b64 = await blobToBase64(blob);
        sendResponse({ blob: b64 });
      } catch (e) {
        console.log(e);
        sendResponse({ blob: "" });
      }
    })();
    return true;
  } else {
    return true;
  }
});

// disabled / enabled 됐을 시 아이콘 변경
browser.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.action === "updateIcon") {
      if (msg.value === "disabled") {
        browser.browserAction.setIcon({
          path : {
            "16": "/assets/icon_disabled_16x16.png",
            "32": "/assets/icon_disabled_32x32.png",
            "48": "/assets/icon_disabled_48x48.png",
            "128": "/assets/icon_disabled_128x128.png"
          }
        });
      } else {
        browser.browserAction.setIcon({
          path : {
            "16": "/assets/icon_16x16.png",
            "32": "/assets/icon_32x32.png",
            "48": "/assets/icon_48x48.png",
            "128": "/assets/icon_128x128.png"
          }
        });
      }
  }
});