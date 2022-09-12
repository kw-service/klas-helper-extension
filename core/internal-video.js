if (typeof browser === "undefined") {
  var browser = chrome;
}
let speed = 1
var b = undefined;
const buttonCss = {
  "float": "right",
  "background-color": "#373737",
  "color": "#b1b1b1",
  "border": "0",
  "cursor": "pointer",
  "bottom": "0px",
  "border-radius": "30%",
  "margin-top": "4px",
  "margin-left": "5px",
}
const changeVideoSpeed = (speed) => {
  speed = isNaN(speed) ? 1 : speed
  b._eventTarget.fire(VCPlayControllerEvent.CHANGE_PLAYBACK_RATE, Number(speed));
  $(".vc-pctrl-playback-rate-toggle-btn").text("x " + speed.toFixed(1))
}

const renderVideoController = () => {
  if ($(".vc-pctrl-playback-rate-setbox").length > 0) {
    b = bcPlayController.getPlayController();

    // 비디오 속도 제한 해제
    uniPlayerConfig.getUniPlayerSettingsData().maxPlaybackRate = 9999
    uniPlayerConfig.getUniPlayerSettingsData().minPlaybackRate = 0.1
    
    console.log(cookieManager.getCookie(cookieManager.PLAYBACK_RATE))
    speed = Number(cookieManager.getCookie(CookieManager.PLAYBACK_RATE))
    speed = isNaN(speed) ? 1 : speed
    
    const $decreaseSpeed = $("<button class='vc-pctrl-playback-rate-decrease'>&lt</button>", {
      class: "vc-pctrl-playback-rate-setbox-btn",
    })
    const $increaseSpeed = $("<button class='vc-pctrl-playback-rate-increase'>&gt</button>", {
      class: "vc-pctrl-playback-rate-setbox-btn",
    })
    $decreaseSpeed.css(buttonCss)
    $increaseSpeed.css(buttonCss)
    $decreaseSpeed.click(() => { speed -= 0.1; changeVideoSpeed(speed) })
    $increaseSpeed.click(() => { speed += 0.1; changeVideoSpeed(speed) })
    
    $(".vc-pctrl-buttons-bar").append($increaseSpeed)
    $(".vc-pctrl-buttons-bar").append($decreaseSpeed)

    // Hooking onKey?Down
    b.onKeyZDown = () => {
      speed = 1;
      changeVideoSpeed(speed);
    }
    b.onKeyXDown = () => {
      speed -= 0.1;
      changeVideoSpeed(speed);
    }
    b.onKeyCDown = () => {
      speed += 0.1;
      changeVideoSpeed(speed);
    }
    changeVideoSpeed(speed);

    // Change height of video, for android view
    if (window.innerWidth < 768) {
      $("#viewer-root").css("height", "90%")
    }
  } else {
    setTimeout(renderVideoController, 1000);
  }
}


(async() => {
  setTimeout(renderVideoController, 1000);
})();
