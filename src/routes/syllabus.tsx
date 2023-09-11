/**
 * 페이지 이름: 강의 계획서 조회 - 학부
 * 페이지 주소: https://klas.kw.ac.kr/std/cps/atnlc/LectrePlanStdPage.do
 */

import { createRoot } from 'react-dom/client';
import { UniversitySyllabus } from '../components';

declare var appModule: any;
declare var axios: any;

export default () => {
  // 엔터로 강의 계획서 검색
  $('table:nth-of-type(1) input[type="text"]').keydown((event) => {
    if (event.keyCode === 13) appModule.getSearch();
  });

  // 강의계획서 조회 시 새 창으로 열기
  appModule.goLectrePlan = function (item: any) {
    const selectSubj = 'U' + item.thisYear + item.hakgi + item.openGwamokNo + item.openMajorCode + item.bunbanNo + item.openGrade;

    if (item.closeOpt === 'Y') {
      alert('폐강된 강의 입니다.');
      return false;
    }
    if (item.summary === null) {
      alert('강의 계획서 정보가 없습니다!');
      return false;
    }

    axios.post('CultureOptOneInfo.do', appModule.$data)
      .then(function (response: any) {
        if (!Boolean(response.data.cultureOpt)) {
          window.open('https://klas.kw.ac.kr/std/cps/atnlc/popup/LectrePlanStdView.do?selectSubj=' + selectSubj, '', 'width=1000, height=800, scrollbars=yes, title=강의계획서 조회');
        }
        else {
          window.open('https://klas.kw.ac.kr/std/cps/atnlc/popup/LectrePlanStdFixedView.do?selectSubj=' + selectSubj, '', 'width=1000, height=800, scrollbars=yes, title=강의계획서 조회');
        }
      });
  };

  // 검색 함수 업그레이드
  appModule.getSearch = function () {
    this.isSearch = 'N';
    this.selectYearHakgi = this.selectYear + ',' + this.selecthakgi;

    // 서버 부하 문제로 모든 강의 계획서 검색 금지
    if (
      this.selectRadio === 'all' &&
        this.selectText === '' &&
        this.selectProfsr === '' &&
        this.cmmnGamok === '' &&
        this.selecthakgwa === ''
    ) {
      alert('과목명 또는 담당 교수를 입력하지 않은 경우 반드시 과목이나 학과를 선택하셔야 합니다.');
      return;
    }

    // 데이터 요청
    axios.post('LectrePlanStdList.do', this.$data).then((response: any) => {
      this.list = response.data;
    });
  };

  // 이전 버전 강의 계획서로 되돌리는 기능 추가
  createOldVersionControl();

  // 신규 강의 계획서 리액트 렌더링
  $('.con_tab').after('<div id="react-app"></div>');
  createRoot(document.getElementById('react-app')!).render(<UniversitySyllabus />);
};

function createOldVersionControl() {
  // 스타일 추가
  $('#appModule > div:first-of-type')
    .css('display', 'flex')
    .css('align-items', 'center')
    .css('justify-content', 'space-between');

  // 체크박스 추가
  $('.contenttitle').after(`
    <div>
      <input type="checkbox" id="old-version">
        <label for="old-version" style="font-size: 16px;">이전 버전으로 보기</label>
      </input>
    </div>
  `);

  // 체크박스 이벤트 추가
  $('#old-version').change(function () {
    if ($(this).prop('checked')) {
      $('#react-app').css('display', 'none');
      $('#appModule > div > .card').css('display', 'block');
    }
    else {
      $('#react-app').css('display', 'block');
      $('#appModule > div > .card').css('display', 'none');
    }
  });

  // 이전 버전 강의 계획서는 기본적으로 숨김
  $('#appModule > div > .card').css('display', 'none');
}
