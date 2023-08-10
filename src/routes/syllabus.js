/**
 * 페이지 이름: 강의 계획서 조회 - 학부
 * 페이지 주소: https://klas.kw.ac.kr/std/cps/atnlc/LectrePlanStdPage.do
 */

export default () => {
  // 엔터로 강의 계획서 검색
  $('table:nth-of-type(1) input[type="text"]').keydown((event) => {
    if (event.keyCode === 13) appModule.getSearch();
  });

  // 강의계획서 조회 시 새 창으로 열기
  appModule.goLectrePlan = function (item) {
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
      .then(function (response) {
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
    axios.post('LectrePlanStdList.do', this.$data).then((response) => {
      this.list = response.data;
    });
  };
};
