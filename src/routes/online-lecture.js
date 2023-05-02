import { generateRandomString } from '../utils/string';

/**
 * 페이지 이름: 온라인 강의 콘텐츠 보기
 * 페이지 주소: https://klas.kw.ac.kr/std/lis/evltn/OnlineCntntsStdPage.do
 */

export default () => {
  // 강의 숨기기 기능에 맞도록 표 레이아웃 구현 방식 수정
  appModule.setRowspan = function () {
    for (let i = 1; i <= 16; i++) {
      const weekRows = $('.weekNo-' + i);
      const moduleTitleRows = $('.moduletitle-' + i);
      const totalTimeRows = $('.totalTime-' + i);

      weekRows.removeAttr('rowspan').show();
      moduleTitleRows.removeAttr('rowspan').show();
      totalTimeRows.removeAttr('rowspan').show();

      if (weekRows.length > 1) {
        weekRows.eq(0).attr('rowspan', weekRows.length);
        weekRows.not(':eq(0)').hide();
      }

      if (moduleTitleRows.length > 1) {
        moduleTitleRows.eq(0).attr('rowspan', moduleTitleRows.length);
        moduleTitleRows.not(':eq(0)').hide();
      }

      if (totalTimeRows.length > 1) {
        totalTimeRows.eq(0).attr('rowspan', totalTimeRows.length);
        totalTimeRows.not(':eq(0)').hide();
      }
    }
  };

  const coolTimeButtonId = generateRandomString();
  const hideLectureButtonId = generateRandomString();

  // 안내 문구 및 새로운 기능 렌더링
  $('#appModule > table:not(#prjctList)').after(`
    <div id="new-features" style="border: 1px solid #d3d0d0; border-radius: 5px; margin-top: 30px; padding: 10px">
      <div>온라인 강의 다운로드는 '보기' 버튼을 누르면 나오는 강의 화면 페이지에서 이용하실 수 있습니다.</div>
      <div style="color: red">온라인 강의 시 사용되는 강의 내용을 공유 및 배포하는 것은 저작권을 침해하는 행위이므로 꼭 개인 소장 용도로만 이용해 주시기 바랍니다.</div>
      <div style="font-weight: bold; margin-top: 10px">추가된 기능</div>
      <div>- 2분 쿨타임 제거: 2분 쿨타임을 제거할 수 있습니다. 단, 동시에 여러 콘텐츠 학습을 하지 않도록 주의해 주세요.</div>
      <div>- 강의 숨기기: 진도율 100%인 강의를 숨길 수 있습니다.</div>
      <div style="margin-top: 20px">
        <button type="button" id="${coolTimeButtonId}" class="btn2 btn-learn">2분 쿨타임 제거</button>
        <button type="button" id="${hideLectureButtonId}" class="btn2 btn-gray">강의 숨기기 On / Off</button>
      </div>
    </div>
  `);

  // 2분 쿨타임 제거 버튼에 이벤트 설정
  $(`#${coolTimeButtonId}`).click(() => {
    let funcName = 'getLrnStdSttus1';

    // 함수 이름이 바뀌었을 때를 대비해서 스크립트에서 함수 이름을 찾아서 사용
    for (let i in document.scripts) {
      let script = document.scripts[i];
      let innerHtml = script.innerHTML;
      if (!innerHtml) continue;
      let items = innerHtml.split('},');
      for (let j in items) {
        let item = items[j];
        if (item.indexOf(':') === -1) continue;
        if (item.indexOf('viewer/') !== -1 && item.indexOf('height') !== -1 && item.indexOf('width=') !== -1) {
          funcName = item.split(':')[0];
          if (funcName) {
            funcName = funcName.trim();
            break;
          }
        }
      }
    }

    // 2분 쿨타임 제거
    if (appModule[funcName]) {
      appModule[funcName] = function () {
        axios.post('/std/lis/evltn/SelectLrnSttusStd.do', this.$data).then(function (response) {
          this.lrnSttus = response.data;

          if (response.data === 'Y' || response.data === 'N') {
            if (ios) {
              $('#viewForm').prop('target', '_blank').prop('action', '/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do').submit();
            }
            else {
              let popup = window.open('', 'previewPopup', 'resizable=yes, scrollbars=yes, top=100px, left=100px, height=' + this.height + 'px, width= ' + this.width + 'px');
              $('#viewForm').prop('target', 'previewPopup').prop('action', '/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do').submit().prop('target', '');
              popup.focus();
            }
          }
          else if (response.request.responseURL.includes('LoginForm.do')) {
            linkUrl(response.request.responseURL);
          }
        }.bind(this));
      };

      alert('2분 쿨타임이 제거되었습니다.');
    }
    else {
      alert('2분 쿨타임을 제거하지 못했습니다.');
    }
  });


  // 강의 숨기기 버튼에 이벤트 설정
  $(`#${hideLectureButtonId}`).click(() => {
    if (appModule.listBackup) {
      appModule.list = appModule.listBackup;
      appModule.listBackup = undefined;
    }
    else {
      appModule.listBackup = appModule.list;
      appModule.list = appModule.list.filter((v) => { if (v.prog !== 100) return v; });
    }

    $(`#${hideLectureButtonId}`).toggleClass('btn-gray');
    $(`#${hideLectureButtonId}`).toggleClass('btn-green');
  });

  // 과목 변경 시 적용된 기능 초기화
  $('select[name="selectSubj"]').change(() => {
    appModule.listBackup = undefined;
    $('#new-features .btn-green').toggleClass('btn-green').toggleClass('btn-gray');
  });
};
