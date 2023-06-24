/**
 * 페이지 이름: 강의계획서 조회
 * 페이지 주소: https://klas.kw.ac.kr/std/cps/atnlc/popup/LectrePlanStdView.do?
 */

export default () => {
  const getSearch = () => {
    axios.post('/std/cps/atnlc/popup/LectrePlanStdCrtNum.do', {
      currentNum: appModule.$data.currentNum,
      gwamokName: appModule.$data.gwamokName,
      numText: appModule.$data.numText,
      randomNum: appModule.$data.randomNum,
      selectGrcode: appModule.$data.selectGrcode,
      selectSubj: appModule.$data.selectSubj,
      selectYear: appModule.$data.selectYear,
      selectYearHakgi: appModule.$data.selectYearHakgi,
      selecthakgi: appModule.$data.selecthakgi,
      stopFlag: appModule.$data.stopFlag,
    })
      .then(function (response) {
        const currentNum = response.data.currentNum;
        $('#student-number').text(currentNum);
      });
  };

  // 수강인원조회라는 항목을 가진 버튼 찾기
  const $button = $('button').filter((index, element) => {
    return $(element).text() === '수강인원조회';
  });

  // 부모 요소 찾기
  const $parent = $button.parent();

  // 새로운 버튼 및 Span 생성
  const $newButton = $('<button id="student-get">조회</button>');
  const $span = $('<span id="student-number"></span>');
  $span.css('margin-left', '10px');

  $parent.append($newButton);
  $parent.append($span);

  // 기존 버튼 삭제
  $button.remove();

  // 수강인원조회 버튼 클릭 시
  $newButton.click(() => {
    getSearch();
  });
};
