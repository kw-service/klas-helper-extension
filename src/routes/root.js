/**
 * 페이지 이름: 모든 페이지
 * 페이지 주소: https://klas.kw.ac.kr/*
 * 주의사항 : 이 파일의 스크립트는 klas.kw.ac.kr 도메인의 모든 사이트에 적용되므로 조건을 잘 체크해주세요.
 */

const renewSession = () => {
  // Call extern function
  // The extern function defines in HTML
  let funcName = 'sessionExtensionReq1';
  for (let i in document.scripts) {
    let script = document.scripts[i];
    let innerHtml = script.innerHTML;
    if (!innerHtml) continue;
    let items = innerHtml.split('function ');
    for (let j in items) {
      let item = items[j];
      if (item.indexOf('(') === -1) continue;
      if (item.indexOf('/usr/cmn/login/UpdateSession.do') !== -1) {
        funcName = item.split('(')[0];
        if (funcName) funcName = funcName.trim();
        break;
      }
    }
  }
  const sessionRenewFunction = typeof (self[funcName]) === 'function' ? self[funcName] : undefined;

  if (sessionRenewFunction) sessionRenewFunction();
  return;
};

export default () => {
  // 학번의 학과 번호별로 DB 저장
  const colleageDB = {
    706: { 'colleage': '전자정보공과대학', 'major': '전자공학과', 'colleageHomepage': 'https://ei.kw.ac.kr/', 'majorHomepage': 'https://ee.kw.ac.kr/' },
    707: { 'colleage': '전자정보공과대학', 'major': '전자통신공학과', 'colleageHomepage': 'https://ei.kw.ac.kr/', 'majorHomepage': 'https://ee.kw.ac.kr/' },
    742: { 'colleage': '전자정보공과대학', 'major': '전자융합공학과', 'colleageHomepage': 'https://ei.kw.ac.kr/', 'majorHomepage': 'https://ee.kw.ac.kr/' },
    732: { 'colleage': '전자정보공과대학', 'major': '전기공학과', 'colleageHomepage': 'https://ei.kw.ac.kr/', 'majorHomepage': 'https://ee.kw.ac.kr/' },
    734: { 'colleage': '전자정보공과대학', 'major': '전자재료공학과', 'colleageHomepage': 'https://ei.kw.ac.kr/', 'majorHomepage': 'https://ee.kw.ac.kr/' },
    741: { 'colleage': '전자정보공과대학', 'major': '로봇학부', 'colleageHomepage': 'https://ei.kw.ac.kr/', 'majorHomepage': 'https://ee.kw.ac.kr/' },

    202: { 'colleage': '소프트웨어융합대학', 'major': '컴퓨터정보공학부', 'colleageHomepage': 'https://sw.kw.ac.kr:501/', 'majorHomepage': 'https://ce.kw.ac.kr:501/' },
    203: { 'colleage': '소프트웨어융합대학', 'major': '소프트웨어학부', 'colleageHomepage': 'https://sw.kw.ac.kr:501/', 'majorHomepage': 'https://cs.kw.ac.kr:501/' },
    204: { 'colleage': '소프트웨어융합대학', 'major': '정보융합학부', 'colleageHomepage': 'https://sw.kw.ac.kr:501/', 'majorHomepage': 'https://ic.kw.ac.kr:501/' },

    127: { 'colleage': '공과대학', 'major': '건축학과', 'colleageHomepage': '', 'majorHomepage': 'https://www.kwuarchitecture.com/' },
    117: { 'colleage': '공과대학', 'major': '건축공학과', 'colleageHomepage': '', 'majorHomepage': 'http://archi.kw.ac.kr/' },
    114: { 'colleage': '공과대학', 'major': '화학공학과', 'colleageHomepage': '', 'majorHomepage': 'http://chemng.kw.ac.kr/' },
    116: { 'colleage': '공과대학', 'major': '환경공학과', 'colleageHomepage': '', 'majorHomepage': 'http://env.kw.ac.kr/' },

    603: { 'colleage': '자연과학대학', 'major': '수학과', 'colleageHomepage': '', 'majorHomepage': '' },
    610: { 'colleage': '자연과학대학', 'major': '전자바이오물리학과', 'colleageHomepage': '', 'majorHomepage': '' },
    605: { 'colleage': '자연과학대학', 'major': '화학과', 'colleageHomepage': '', 'majorHomepage': 'http://chem.kw.ac.kr/' },
    613: { 'colleage': '자연과학대학', 'major': '스포츠융합과학과', 'colleageHomepage': '', 'majorHomepage': 'http://sports.kw.ac.kr/' },
    612: { 'colleage': '자연과학대학', 'major': '정보콘텐츠학과', 'colleageHomepage': '', 'majorHomepage': '' },

    304: { 'colleage': '인문사회과학대학', 'major': '국어국문학과', 'colleageHomepage': 'http://chss.kw.ac.kr/', 'majorHomepage': '' },
    322: { 'colleage': '인문사회과학대학', 'major': '영어산업학과', 'colleageHomepage': 'http://chss.kw.ac.kr/', 'majorHomepage': 'https://english.kw.ac.kr/' },
    323: { 'colleage': '인문사회과학대학', 'major': '미디어커뮤니케이션학부', 'colleageHomepage': 'http://chss.kw.ac.kr/', 'majorHomepage': 'https://www.kwmedia.info/' },
    311: { 'colleage': '인문사회과학대학', 'major': '산업심리학과', 'colleageHomepage': 'http://chss.kw.ac.kr/', 'majorHomepage': 'http://psy.kw.ac.kr/' },
    321: { 'colleage': '인문사회과학대학', 'major': '동북아문화산업학부', 'colleageHomepage': 'http://chss.kw.ac.kr/', 'majorHomepage': '' },

    802: { 'colleage': '정책법학대학', 'major': '행정학과', 'colleageHomepage': '', 'majorHomepage': 'http://kwpa.kw.ac.kr/' },
    804: { 'colleage': '정책법학대학', 'major': '국제학부', 'colleageHomepage': '', 'majorHomepage': 'https://sjang21.wixsite.com/dois-kw' },
    803: { 'colleage': '정책법학대학', 'major': '법학부', 'colleageHomepage': '', 'majorHomepage': 'https://law.kw.ac.kr/' },
    805: { 'colleage': '정책법학대학', 'major': '자산관리학과', 'colleageHomepage': '', 'majorHomepage': '' },

    508: { 'colleage': '경영대학', 'major': '경영학부', 'colleageHomepage': 'http://biz.kw.ac.kr/', 'majorHomepage': 'https://biz.kw.ac.kr/' },
    510: { 'colleage': '경영대학', 'major': '국제통상학부', 'colleageHomepage': 'http://biz.kw.ac.kr/', 'majorHomepage': 'https://biz.kw.ac.kr/' },

  };

  // Set interval to renew session
  setInterval(renewSession, 1000 * 60 * 5);
  // Delete session element
  $('.toplogo').css({ 'max-width': '30%' });
  $('.navtxt').css({ 'max-width': '70%', 'min-width': '70%' });
  const sessionAutoRenewContainer = $('<span style="">자동 세션 갱신 중</span>');
  const noticeButton = $('<button style="color: #afa5a9; background: none; border: 2px solid #afa5a9; border-radius: 25%; cursor: pointer; margin: 5px; font-size: 10px; padding: 2px 4px; line-height: 1; height: 20px;"><i class="fas fa-exclamation"></i></button>');

  // klas-helper-text 요소를 찾아서 sessionAutoRenewButton 추가
  const checkAndAddButton = setInterval(() => {
    const klasHelperText = $('.klas-helper-text');
    if (klasHelperText.length > 0) {
      klasHelperText.after(noticeButton);
      clearInterval(checkAndAddButton);
    }
  }, 100);

  $('#remainingCounter').after(sessionAutoRenewContainer);
  const noticeTitle = 'KLAS Helper 공지사항';
  const noticeBody = `<p style="font-weight: bold;">안녕하세요. KLAS Helper 확장 프로그램 개발팀 kw-service입니다.</p>
  <p>저희는 2020년 KLAS로 처음 전환되기 시작한 몇 달 뒤부터 지원을 시작해, 지금까지 평균 약 8천명의 재학생 분들이 해당 확장 프로그램을 사용해 주시고 있습니다.</p>
  <p>하지만, 현재는 대부분의 메인테이너 분들이 졸업을 하고, 그로 인해 프로그램의 유지보수가 힘들어진 상황입니다.</p>
  <p>그렇기에, 해당 프로그램에 관심을 가지고 계속해서 유지/보수 및 관리에 도움을 주실 분을 찾고 있습니다.</p>
  <p>코딩 실력이나, 프로그램 개발 경험이 많지 않아도, 관심이 있으시다면 언제든지 참여해주세요.</p>
  <p style="font-style: italic;">관심이 있으신분은, 아래 Discord에 참가하시거나, 아래 이메일로 문의 부탁드리겠습니다.</p>
  <p style="text-align: center;">이메일: <a href="mailto:mirusu400@naver.com" style="color: green;">mirusu400@naver.com</a></p>
  <p style="text-align: center;">디스코드: <a href="https://discord.gg/m8GKEwBK" style="color: red;">https://discord.gg/m8GKEwBK</a></p>
  <p style="text-align: center;">GitHub: <a href="https://github.com/kw-service/klas-helper-extension" style="color: blue;">https://github.com/kw-service/klas-helper-extension</a></p>
  <p style="font-weight: bold;">많은 후배분들의 관심 및 참여 부탁드리겠습니다.</p>
  <p style="font-size: larger;">감사합니다!</p>
  `;

  noticeButton.click(() => {
    const popup = $(`
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 9999; display: flex; justify-content: center; align-items: center;">
        <div style="background: white; padding: 20px; border-radius: 8px; width: 600px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #333;">
            ${noticeTitle}
            </h3>
            <button class="close-btn" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #666;">×</button>
          </div>
          <div style="color: #333;">
            ${noticeBody}
          </div>
        </div>
      </div>
    `);

    // 팝업 닫기 버튼 이벤트
    popup.find('.close-btn').click(() => {
      popup.remove();
    });

    // 팝업 외부 클릭시 닫기
    popup.click((e) => {
      if (e.target === popup[0]) {
        popup.remove();
      }
    });

    $('body').append(popup);
  });
  $('#remainingCounter').remove();

  $('.fa-retweet').parent().remove();

  const topMenu = $('.topmenutxt');

  if (topMenu) {
    const myColleageNumber = parseInt($('a[href*="/std/ads/admst/MyInfoStdPage.do"]').text().split('(')[1].slice(4, 7));
    const myColleageDB = colleageDB[myColleageNumber];
    const classInfoUl = topMenu.children().eq(1).find('.depth02ul');

    const newLi = $(`<li>
      <a href="#" onclick="linkUrl('');">홈페이지 바로가기</a>                                                            
      <ul class="depth03ul">
        <li>
          <a href="#" onclick="linkWinOpen('https://www.kw.ac.kr/ko/index.jsp');">광운대학교 홈페이지</a>                                                            
        </li>
        <li>
          <a href="#" onclick="linkWinOpen('https://www.kw.ac.kr/ko/life/notice.jsp');">광운대학교 공지사항</a>                                                            
        </li>
        ${myColleageDB['colleageHomepage'] ? `<li>
            <a href="#" onclick="linkWinOpen('${myColleageDB['colleageHomepage']}');">${myColleageDB['colleage']} 홈페이지</a> 
           <li>
          ` : ''}
        ${myColleageDB['majorHomepage'] ? `<li>
            <a href="#" onclick="linkWinOpen('${myColleageDB['majorHomepage']}');">${myColleageDB['major']} 홈페이지</a> 
           <li>
          ` : ''}
      </ul>
    </li>`);
    classInfoUl.append(newLi);

    // 졸업가부 및 졸업불가사유 확인 메뉴 추가
    $('.depth03ul:eq(8)').append(`
      <li>
        <a href="/std/ext/grdtn/GrdtnYnImprtyResnStdPage.do">졸업가부 및 졸업불가사유 확인</a>
      </li>
    `);
  }
};
