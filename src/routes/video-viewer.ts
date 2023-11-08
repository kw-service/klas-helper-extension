/*
  비디오 뷰어 페이지
  klas.kw.ac.kr/* 도메인에 존재하는 것이 아닌,
  kwcommons.kw.ac.kr/* 도메인에 inject하는 스크립트 입니다.

*/

import $ from 'jquery';

declare var VCPlayControllerEvent: any;
declare var bcPlayController: any;
declare var uniPlayerConfig: any;
declare var cookieManager: any;
declare var CookieManager: any;

var speed = 1;
var b: any = undefined;
const buttonCss = {
  'float': 'right',
  'background-color': '#373737',
  'color': '#b1b1b1',
  'border': '0',
  'cursor': 'pointer',
  'bottom': '0px',
  'border-radius': '30%',
  'margin-top': '4px',
  'margin-left': '5px',
};
const changeVideoSpeed = (speed: any) => {
  speed = speed ? speed : 1;
  b._eventTarget.fire(VCPlayControllerEvent.CHANGE_PLAYBACK_RATE, Number(speed));
  $('.vc-pctrl-playback-rate-toggle-btn').text('x ' + speed.toFixed(2));
};

const renderVideoController = () => {
  if ($('.vc-pctrl-playback-rate-setbox').length > 0) {
    b = bcPlayController.getPlayController();

    // 비디오 속도 제한 해제
    uniPlayerConfig.getUniPlayerSettingsData().maxPlaybackRate = 9999;
    uniPlayerConfig.getUniPlayerSettingsData().minPlaybackRate = 0.1;

    speed = Number(cookieManager.getCookie(CookieManager.PLAYBACK_RATE));
    speed = speed ? speed : 1;

    const $decreaseSpeed = $("<button class='vc-pctrl-playback-rate-decrease'>&lt</button>", {
      class: 'vc-pctrl-playback-rate-setbox-btn',
    });
    const $increaseSpeed = $("<button class='vc-pctrl-playback-rate-increase'>&gt</button>", {
      class: 'vc-pctrl-playback-rate-setbox-btn',
    });
    $decreaseSpeed.css(buttonCss);
    $increaseSpeed.css(buttonCss);
    $decreaseSpeed.click(() => {
      speed = Number(cookieManager.getCookie(CookieManager.PLAYBACK_RATE));
      speed = speed ? speed : 1;
      speed -= 0.1; changeVideoSpeed(speed);
    });
    $increaseSpeed.click(() => {
      speed = Number(cookieManager.getCookie(CookieManager.PLAYBACK_RATE));
      speed = speed ? speed : 1;
      speed += 0.1; changeVideoSpeed(speed);
    });

    $('.vc-pctrl-buttons-bar').append($increaseSpeed);
    $('.vc-pctrl-buttons-bar').append($decreaseSpeed);

    // Hooking onKey?Down
    b.onKeyZDown = () => {
      speed = 1;
      changeVideoSpeed(speed);
    };
    b.onKeyXDown = () => {
      speed -= 0.1;
      changeVideoSpeed(speed);
    };
    b.onKeyCDown = () => {
      speed += 0.1;
      changeVideoSpeed(speed);
    };
    changeVideoSpeed(speed);

    // Change height of video, for android view
    if (window.innerWidth < 768) {
      $('#viewer-root').css('height', '90%');
    }
  }
  else {
    setTimeout(renderVideoController, 1000);
  }
};

(async () => {
  setTimeout(renderVideoController, 1000);
})();
