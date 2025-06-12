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

// 전역 변수 선언
declare global {
  interface Window {
    volumeObserver?: MutationObserver;
  }
}

// HTMLVideoElement 인터페이스 확장
interface HTMLVideoElement {
  volume: number;
}

// AudioContext 관련 변수 제거
let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;
let streamSource: MediaStreamAudioSourceNode | null = null;

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
  try {
    b._eventTarget.fire(VCPlayControllerEvent.CHANGE_PLAYBACK_RATE, Number(speed));
    $('.vc-pctrl-playback-rate-toggle-btn').text('x ' + speed.toFixed(2));
  }
  catch (error) {
    console.error('Error changing video speed:', error);
  }
};

const renderVideoController = () => {
  if ($('.vc-pctrl-playback-rate-setbox').length > 0) {
    b = bcPlayController.getPlayController();

    // 비디오 속도 제한 해제
    uniPlayerConfig.getUniPlayerSettingsData().maxPlaybackRate = 9999;
    uniPlayerConfig.getUniPlayerSettingsData().minPlaybackRate = 0.1;

    /*
      비디오 속도 조절기능 커스텀 관련 코드
    */
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

    /*
    볼륨 슬라이더 제한 해제 관련 코드
    AudioContext 를 이용하여 볼륨 증폭 기능 추가
    */
    // 비디오 요소 가져오기
    const videoElement = document.querySelector('.vc-vplay-video1');
    if (!(videoElement instanceof HTMLVideoElement)) {
      console.error('비디오 요소를 찾을 수 없습니다.');
      return;
    }

    // AudioContext 초기화
    const initializeAudioContext = (videoElement: HTMLVideoElement) => {
      if (!audioContext) {
        try {
          audioContext = new AudioContext();
          const mediaElement = audioContext.createMediaElementSource(videoElement as HTMLMediaElement);
          gainNode = audioContext.createGain();
          gainNode.gain.value = videoElement.volume; // 비디오의 현재 볼륨으로 초기화
          mediaElement.connect(gainNode);
          gainNode.connect(audioContext.destination);
        }
        catch (error) {
          console.error('AudioContext 초기화 실패:', error);
          audioContext = null;
          gainNode = null;
        }
      }
    };

    // 비디오 재생 이벤트 리스너 추가
    videoElement.addEventListener('play', () => {
      if (!audioContext) {
        initializeAudioContext(videoElement);
      }
      // 재생 시 현재 볼륨 상태 동기화
      if (gainNode) {
        gainNode.gain.value = videoElement.volume;
      }
    });

    // 볼륨 변경 이벤트 리스너 추가
    videoElement.addEventListener('volumechange', () => {
      if (gainNode) {
        gainNode.gain.value = videoElement.volume;
      }
    });

    // 볼륨 슬라이더 이벤트 수정
    const volumeSlider = document.querySelector('.vc-pctrl-volume-slider');
    if (volumeSlider) {
      // 기존 볼륨 게이지 요소
      const volumeGauge = volumeSlider.querySelector('.vc-pctrl-volume-gauge') as HTMLElement;
      const volumeThumb = volumeSlider.querySelector('.vc-pctrl-volume-thumb');
      const volumeHoverArea = document.querySelector('.vc-pctrl-volume-hover-area');
      $('.vc-pctrl-play-time-text-area').css('width', 'fit-content');

      if (volumeGauge && volumeThumb && volumeHoverArea) {
        // 볼륨 입력을 위한 input 요소 생성
        const volumeInput = document.createElement('input');
        volumeInput.type = 'number';
        volumeInput.min = '0';
        volumeInput.max = '800';
        volumeInput.value = '100';
        volumeInput.step = '10';
        volumeInput.style.cssText = `
          width: 45px;
          height: 14px;
          margin-left: 10px;
          padding: 2px;
          border: 1px solid #666;
          background: #373737;
          color: #b1b1b1;
          border-radius: 3px;
          display: inline-block;
          vertical-align: middle;
          margin: 0;
          -moz-appearance: textfield;
          -webkit-appearance: none;
        `;

        // 백스페이스 허용
        volumeInput.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' || e.key === 'Delete') {
            e.stopPropagation();
          }
        });

        // 볼륨 수동조절 텍스트 추가
        const volumeLabel = document.createElement('span');
        volumeLabel.textContent = '[볼륨 수동조절]';
        volumeLabel.style.cssText = `
          color: #b1b1b1;
          font-size: 12px;
          margin-left: 5px;
          vertical-align: middle;
        `;

        const volumeLabel2 = document.createElement('span');
        volumeLabel2.textContent = '%';
        volumeLabel2.style.cssText = `
          color: #b1b1b1;
          font-size: 12px;
          margin-left: 5px;
          vertical-align: middle;
        `;

        // 볼륨 입력 이벤트 처리
        volumeInput.addEventListener('input', function () {
          try {
            const volumePercent = Math.min(Math.max(parseInt(this.value) || 0, 0), 800) / 100;

            // 기본 볼륨 설정 (0-100%)
            if (volumePercent <= 1) {
              videoElement.volume = volumePercent;
              if (gainNode) {
                gainNode.gain.value = 1;
              }
            }
            else {
              // 100% 초과 시 gain으로 증폭
              videoElement.volume = 1;
              if (gainNode) {
                gainNode.gain.value = volumePercent;
              }
            }

            // 볼륨이 0이 아닐 때 재생이 안 되는 문제 해결
            if (videoElement.paused && volumePercent > 0) {
              videoElement.play().catch((error) => {
                console.error('비디오 재생 실패:', error);
              });
            }

            // 슬라이더 게이지 업데이트 (시각적 피드백용)
            const gaugeWidth = Math.min(volumePercent * 100, 100);
            volumeGauge.style.width = `${gaugeWidth}%`;
          }
          catch (error) {
            console.error('볼륨 설정 중 오류:', error);
          }
        });

        // 요소 추가
        volumeHoverArea.after(volumeLabel);
        volumeLabel.after(volumeInput);
        volumeInput.after(volumeLabel2);

        // 기존 볼륨 슬라이더 이벤트 유지
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
              try {
                const gauge = mutation.target as HTMLElement;
                const width = gauge.style.width;
                if (width) {
                  const volumePercent = parseInt(width) / 100;
                  // input 값 업데이트
                  volumeInput.value = Math.round(volumePercent * 100).toString();
                }
              }
              catch (error) {
                console.error('볼륨 게이지 업데이트 중 오류:', error);
              }
            }
          });
        });

        // 볼륨 게이지의 style 속성 변경 감지
        observer.observe(volumeGauge, {
          attributes: true,
          attributeFilter: ['style'],
        });

        // 전역 observer 저장
        window.volumeObserver = observer;
      }
    }

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
