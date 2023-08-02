import { browser } from './core/browser';

async function asyncGetXMLData(request: any) {
  const response = await fetch('https://kwcommons.kw.ac.kr/viewer/ssplayer/uniplayer_support/content.php?content_id=' + request.videoCode);
  const data = await response.text();
  if (response.status === 200) {
    return data;
  }
  else {
    return '';
  }
}

async function asyncGetSlide(request: any) {
  const response = await fetch(request);
  const data = await response.text();
  if (response.status === 200) {
    return data;
  }
  else {
    return '';
  }
}

async function asyncGetImage(imageURI: string) {
  const response = await fetch(imageURI);
  const blob = await response.blob();
  const base64 = await blobToBase64(blob);
  return base64;
}

function blobToBase64(blob: any) {
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
      const xhr = await asyncGetXMLData(request);
      sendResponse({ xhr });
    })();
    return true;
  }
  else if (request.action === 'downloadSlide') {
    (async () => {
      const sXMLs = [];
      for (let i = 0; i < request.slideListURIs.length; i++) {
        try {
          const xhr = await asyncGetSlide(request.slideListURIs[i]);
          sXMLs.push(xhr);
        }
        catch (e) {
          console.log(e);
        }
      }
      sendResponse({ xhrs: sXMLs });
    })();
    return true;
  }
  else if (request.action === 'downloadImage') {
    (async () => {
      try {
        const xhrB64 = await asyncGetImage(request.imageURI);
        sendResponse({ blob: xhrB64 });
      }
      catch (e) {
        console.log(e);
        sendResponse({ blob: '' });
      }
    })();
    return true;
  }
  else {
    return true;
  }
});

// disabled / enabled 됐을 시 아이콘 변경
browser.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.action === 'updateIcon') {
    if (msg.value === 'disabled') {
      browser.action.setIcon({
        path: {
          16: '/assets/images/icon-disabled-16x16.png',
          32: '/assets/images/icon-disabled-32x32.png',
          48: '/assets/images/icon-disabled-48x48.png',
          128: '/assets/images/icon-disabled-128x128.png',
        },
      });
    }
    else {
      browser.action.setIcon({
        path: {
          16: '/assets/images/icon-16x16.png',
          32: '/assets/images/icon-32x32.png',
          48: '/assets/images/icon-48x48.png',
          128: '/assets/images/icon-128x128.png',
        },
      });
    }
  }
});
