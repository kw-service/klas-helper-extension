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

// content.js 와 통신하는 백그라운드 함수
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadVideo') {
    (async () => {
      const oSerializer = new XMLSerializer();
      const xhr = await asyncGetData(request);
      const sXML = oSerializer.serializeToString(xhr.responseXML);
      sendResponse({xhr: sXML});
    })();
    return true;
  }
  else {
    return true;
  }
});