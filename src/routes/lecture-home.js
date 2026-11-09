import { compressScheduleText } from '../utils/scheduleText';
import { generateRandomString } from '../utils/string';

/**
 * 페이지 이름: 강의 종합
 * 페이지 주소: https://klas.kw.ac.kr/std/lis/evltn/LctrumHomeStdPage.do
 */

// 강의 묻고답하기, 강의 공지사항 추가
const addBoard = async () => {
  const selectedSubj = $("input[name='selectedSubj']").val();
  const questionBoardUid = $("a[onclick*='BoardQnaListStdPage.do']").attr('onclick').split("linkUrl('/std/lis/sport/")[1].split('/')[0];
  const selectedYearhakgi = $("input[name='selectedYearhakgi']").val();
  let boardCount = 0;
  let isNew = false;
  const response = await axios.post(`/std/lis/sport/${questionBoardUid}/BoardStdList.do`, {
    'cmd': null,
    'pageInit': true,
    'selectYearhakgi': selectedYearhakgi,
    'selectSubj': selectedSubj,
    'selectChangeYn': 'Y',
    'searchCondition': 'ALL',
    'searchKeyword': '',
    'currentPage': 0,
  });
  const data = response.data;
  const totalPages = data.page.totalPages;
  const latestWrite = data.list.length > 0 ? new Date(data.list[0].registDt) : new Date(0, 0, 0);
  const today = new Date();
  // 1일 이내의 게시글이 있다면 새로운 게시글이 있다고 알림
  if ((today - latestWrite) < 1000 * 60 * 60 * 24) {
    isNew = true;
  }
  for (let i = 0; i < totalPages; i++) {
    const response = await axios.post(`/std/lis/sport/${questionBoardUid}/BoardStdList.do`, {
      'cmd': null,
      'pageInit': true,
      'selectYearhakgi': selectedYearhakgi,
      'selectSubj': selectedSubj,
      'selectChangeYn': 'Y',
      'searchCondition': 'ALL',
      'searchKeyword': '',
      'currentPage': i,
    });
    const data = response.data;
    boardCount += data.list.length;
  }
  if ($('.custom-boardcount').length > 0) {
    $('.custom-boardcount').text(boardCount);
  }
  else {
    $($('.subjectpresent')[0]).append(`
      <li><a href="#" onclick="linkUrl('/std/lis/sport/573f918c23984ae8a88c398051bb1263/BoardQnaListStdPage.do');">강의 묻고답하기${
  isNew ? ' <img v-if="prjctNewCnt > 0" src="/assets/modules/std/images/common/icon-new.png"> ' : ''
} <!----><span class="oval custom-boardcount">${boardCount}</span></a></li>
    `);
  }
};

// 강의계획서 조회 버튼 추가
const addLecturePlan = async () => {
  const redirectLectureHandler = async () => {
    const selectedSubj = $("input[name='selectedSubj']").val();
    window.open('https://klas.kw.ac.kr/std/cps/atnlc/popup/LectrePlanStdView.do?selectSubj=' + selectedSubj, '', 'width=1000, height=800, scrollbars=yes, title=강의계획서 조회');
  };
  const lectureElem = $('<span class="subjectLectureInfo">강의계획서 조회</span>');
  // set style
  lectureElem.css({
    'margin-left': '15px',
  });
  lectureElem.click(redirectLectureHandler);
  $('.subtitle').append(lectureElem);

  // 계절학기(여름·겨울)는 시간표 문구가 길어 상단 막대 밖으로 줄바꿈되면 "강의계획서 조회"가 가려지므로,
  // 해당 학기에서만 한 줄로 유지하고 문구를 줄여 버튼이 항상 보이게 합니다. (1·2학기는 기존 모양 그대로)
  if (!document.getElementById('klas-helper-lecture-bar')) {
    $('<style id="klas-helper-lecture-bar"></style>').text(`
      .subjectnameba .subtitle.${COMPACT_CLASS} { display: flex; align-items: baseline; white-space: nowrap; }
      .subjectnameba .subtitle.${COMPACT_CLASS} .subjectname { flex: none; }
      .subjectnameba .subtitle.${COMPACT_CLASS} .subjecttime { flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
      .subjectnameba .subtitle.${COMPACT_CLASS} .subjectLectureInfo { flex: none; }
    `).appendTo('head');
  }

  compressScheduleHeader();
};

/** 계절학기 강의실의 상단 막대에 붙이는 클래스 */
const COMPACT_CLASS = 'klas-helper-compact';

/** 현재 강의실의 학기가 계절학기(3: 여름, 4: 겨울)인지 확인 */
const isSeasonalSemester = () => {
  // 상단 막대는 별도 Vue 인스턴스이며, 과목을 바꾸면 이 값도 함께 바뀝니다
  const header = document.querySelector('#appHeaderSubj')?.__vue__;
  const yearhakgi = header?.$data?.selectYearhakgi ?? $("input[name='selectedYearhakgi']").val();
  return /,\s*[34]$/.test(String(yearhakgi ?? '').trim());
};

/**
 * 계절학기 강의실에서 상단 막대의 시간표 문구를 같은 교시·장소끼리 묶어 줄입니다.
 * 예) "월 5,6교시/비211, 화 5,6교시/비211" → "월·화 5,6교시/비211"
 *
 * 문구는 Vue가 그리므로 텍스트 노드를 교체하지 않고 값만 바꾸며,
 * 과목을 바꿔 문구가 갱신되면 다시 판단합니다. 원래 문구는 마우스를 올렸을 때 툴팁으로 보여 줍니다.
 * 1·2학기에는 아무것도 바꾸지 않습니다.
 */
const compressScheduleHeader = () => {
  const apply = () => {
    const subtitle = document.querySelector('.subtitle');
    const element = subtitle?.querySelector('.subjecttime');
    const textNode = element && [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim());

    if (!textNode) {
      return;
    }

    const current = textNode.nodeValue.trim();

    // 1·2학기: 이전에 줄여 둔 문구가 남아 있으면 되돌리고, 그 외에는 아무것도 하지 않습니다
    if (!isSeasonalSemester()) {
      subtitle.classList.remove(COMPACT_CLASS);

      if (element.dataset.klasHelperOriginal && current === element.dataset.klasHelperCompressed && current !== element.dataset.klasHelperOriginal) {
        // 함수로 치환해 문구 안의 $& 같은 특수 패턴이 해석되지 않게 합니다
        const original = element.dataset.klasHelperOriginal;
        textNode.nodeValue = textNode.nodeValue.replace(current, () => original);
      }

      delete element.dataset.klasHelperOriginal;
      delete element.dataset.klasHelperCompressed;

      // 계절학기에서 붙인 툴팁이 남아 있으면 지웁니다
      if (element.dataset.klasHelperTitled) {
        element.removeAttribute('title');
        delete element.dataset.klasHelperTitled;
      }

      return;
    }

    subtitle.classList.add(COMPACT_CLASS);

    // 이미 줄여 둔 문구이면 건너뜁니다 (우리가 바꾼 값에 반응해 다시 실행되는 것도 여기서 끝남)
    if (element.dataset.klasHelperCompressed === current) {
      return;
    }

    const compressed = compressScheduleText(current);
    element.dataset.klasHelperOriginal = current;
    element.dataset.klasHelperCompressed = compressed;

    if (compressed !== current) {
      // 함수로 치환해 문구 안의 $& 같은 특수 패턴이 해석되지 않게 합니다
      textNode.nodeValue = textNode.nodeValue.replace(current, () => compressed);
    }
  };

  // 줄여진 문구 위에 마우스를 올리면 원래 문구 전체를 보여 줍니다 (계절학기에서만)
  $('.subtitle').on('mouseenter', '.subjecttime', function () {
    if (this.closest('.subtitle').classList.contains(COMPACT_CLASS)) {
      this.title = this.dataset.klasHelperOriginal || this.textContent.trim();
      this.dataset.klasHelperTitled = 'true';
    }
  });

  const target = document.querySelector('#appHeaderSubj') || document.querySelector('.subtitle');

  if (target) {
    new MutationObserver(apply).observe(target, { childList: true, characterData: true, subtree: true });
  }

  apply();
};

export default () => {
  const coolTimeButtonId = generateRandomString();
  const hideLectureButtonId = generateRandomString();

  // 2분 쿨타임 제거 기능, 강의 숨기기 버튼 생성
  $("p:contains('온라인 강의리스트')").append(`
    <button type="button" id="${coolTimeButtonId}" class="btn2 btn-learn">2분 쿨타임 제거</button>
    <button type="button" id="${hideLectureButtonId}" class="btn2 btn-gray">강의 숨기기 On / Off</button>
  `);

  // 2분 쿨타임 제거 버튼에 이벤트 설정
  $(`#${coolTimeButtonId}`).click(() => {
    appModule.getLrnSttus = function () {
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
  });

  // 강의 숨기기 버튼에 이벤트 설정
  $(`#${hideLectureButtonId}`).click(() => {
    if (appModule.origin === undefined) {
      appModule.origin = appModule.cntntList;
      let copy = [];
      appModule.cntntList.forEach((item) => {
        if (item.prog !== '100') copy.push(item);
      });
      appModule.cntntList = copy;
    }
    else {
      appModule.cntntList = appModule.origin;
      appModule.origin = undefined;
    }

    $(`#${hideLectureButtonId}`).toggleClass('btn-green');
    $(`#${hideLectureButtonId}`).toggleClass('btn-gray');
  });

  // 과목 변경시 강의 숨기기 초기화
  $("select[name='selectSubj']").change(() => {
    appModule.origin = undefined;
    $('.btn-green').toggleClass('btn-green').toggleClass('btn-gray');
    setTimeout(addBoard, 500);
  });

  addLecturePlan();
  setTimeout(addBoard, 500);
};
