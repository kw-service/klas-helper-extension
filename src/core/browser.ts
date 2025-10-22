// Safari 호환성을 위한 브라우저 API 감지
export const browser = (() => {
  // Safari는 window.browser를 지원하지 않으므로 chrome API 사용
  if (typeof window !== 'undefined') {
    // Firefox에서는 window.browser 사용
    if (window.browser) {
      return window.browser;
    }
    // Chrome, Safari에서는 window.chrome 사용
    if (window.chrome) {
      return window.chrome;
    }
  }
  // Background script에서는 global chrome 사용
  return chrome;
})();
