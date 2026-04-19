/**
 * 페이지 이름: 홈
 * 페이지 주소: https://klas.kw.ac.kr/std/cmn/frame/Frame.do
 */

import handleTimeTable from './timetable';

export default () => {
  // 타임테이블 시간 그리기
  handleTimeTable();
  document.querySelector('.scheduletitle > select').addEventListener('change', handleTimeTable);

  // 기말 평가 안내문 표시
  (async () => {
    const settings = {
      nowYear: 2020,
      nowSemester: 1,
      startDate: '2020-06-15',
      endDate: '2020-06-26',
      noticeURL: 'https://www.kw.ac.kr/ko/life/notice.jsp?BoardMode=view&DUID=33096',
    };

    if (!settings.startDate || !settings.endDate) {
      return;
    }

    const startDate = new Date(settings.startDate + ' 00:00:00');
    const endDate = new Date(settings.endDate + ' 23:59:59');
    const nowDate = new Date();

    if (nowDate < startDate || nowDate > endDate) {
      return;
    }

    const postDatas = {
      thisYear: settings.nowYear,
      hakgi: settings.nowSemester,
      termYn: 'Y',
    };

    await axios.post('/std/cps/inqire/LctreEvlTermCheck.do').then((response) => { postDatas['judgeChasu'] = response.data.judgeChasu; });
    await axios.post('/std/cps/inqire/LctreEvlGetHakjuk.do').then((response) => { postDatas['info'] = response.data; });

    let totalCount = 0;
    let remainingCount = 0;

    await axios.post('/std/cps/inqire/LctreEvlsugangList.do', postDatas).then((response) => {
      totalCount = response.data.length;
      remainingCount = response.data.filter((v) => v.judgeChasu === 'N').length;
    });

    if (remainingCount === 0) {
      return;
    }

    // 렌더링
    $('.subjectbox').prepend(`
       <div class="card card-body mb-4">
         <div class="bodtitle">
           <p class="title-text">수업 평가 안내</p>
         </div>
         <div>
           <div>
             <div><strong>${settings.startDate}</strong>부터 <strong>${settings.endDate}</strong>까지 기말 수업 평가를 실시합니다.</div>
             <div style="color: red">수업 평가를 하지 않으면 성적 공개 기간에 해당 과목의 성적을 확인할 수 없으니 잊지 말고 반드시 평가해 주세요.</div>
             <div><strong>${totalCount}개</strong> 중 <strong>${remainingCount}개</strong>의 수업 평가가 남았습니다.</div>
           </div>
           <div style="margin-top: 20px">
             <button type="button" class="btn2 btn-learn" onclick="linkUrl('/std/cps/inqire/LctreEvlStdPage.do')">수업 평가</button>
             <a href="${settings.noticeURL}" target="_blank"><button type="button" class="btn2 btn-gray">공지사항 확인</button></a>
           </div>
         </div>
       </div>
     `);
  })();

  // 수강 과목 현황의 마감 정보 표시
  (() => {
    // 뼈대 코드 렌더링
    $('.subjectbox').prepend(`
       <div class="card card-body mb-4">
         <div class="bodtitle">
           <p class="title-text">수강 과목 현황</p>
         </div>
         <table id="yes-deadline" style="width: 100%">
           <colgroup>
             <col width="21%">
             <col width="25%">
             <col width="25%">
             <col width="25%">
           </colgroup>
           <thead>
             <tr style="border-bottom: 1px solid #dce3eb; font-weight: bold; height: 30px">
               <td></td>
               <td>온라인 강의</td>
               <td>과제</td>
               <td>팀 프로젝트</td>
               <td>퀴즈</td>
             </tr>
           </thead>
           <tbody></tbody>
         </table>
         <div id="no-deadline" style="display: none; text-align: center">
           <span style="color: green; font-weight: bold">남아있는 항목이 없습니다. 깔끔하네요! 😊</span>
         </div>
       </div>
     `);

    // 변경된 과목에 따라 마감 정보 업데이트
    const updateDeadline = async (subjects) => {
      const promises = [];
      const deadline = {};
      let isExistDeadline = false;

      // 현재 수강 중인 과목 얻기
      for (const subject of subjects) {
        deadline[subject.subj] = {
          subjectName: subject.subjNm,
          subjectCode: subject.subj,
          yearSemester: subject.yearhakgi,
          lecture: {
            remainingTime: Infinity,
            remainingCount: 0,
            totalCount: 0,
          },
          homework: {
            remainingTime: Infinity,
            remainingCount: 0,
            totalCount: 0,
          },
          teamProject: {
            remainingTime: Infinity,
            remainingCount: 0,
            totalCount: 0,
          },
          quiz: {
            remainingTime: Infinity,
            remainingCount: 0,
            totalCount: 0,
          },
        };

        // 온라인 강의를 가져올 주소 설정
        promises.push(axios.post('/std/lis/evltn/SelectOnlineCntntsStdList.do', {
          selectSubj: subject.subj,
          selectYearhakgi: subject.yearhakgi,
          selectChangeYn: 'Y',
        }));

        // 과제를 가져올 주소 설정
        promises.push(axios.post('/std/lis/evltn/TaskStdList.do', {
          selectSubj: subject.subj,
          selectYearhakgi: subject.yearhakgi,
          selectChangeYn: 'Y',
        }));

        // 팀 프로젝트를 가져올 주소 설정
        promises.push(axios.post('/std/lis/evltn/PrjctStdList.do', {
          selectSubj: subject.subj,
          selectYearhakgi: subject.yearhakgi,
          selectChangeYn: 'Y',
        }));

        // 퀴즈를 가져올 주소 설정
        promises.push(axios.post('/std/lis/evltn/AnytmQuizStdPage.do', {
          selectSubj: subject.subj,
          selectYearhakgi: subject.yearhakgi,
          selectChangeYn: 'Y',
        }));
      }

      // 온라인 강의 파싱 함수
      const parseLecture = (subjectCode, responseData) => {
        const nowDate = new Date();

        for (const lecture of responseData) {
          if (lecture.evltnSe !== 'lesson' || lecture.prog === 100 || lecture.isonoff === 'OFF') {
            continue;
          }

          const endDate = new Date(lecture.endDate + ':59');
          const hourGap = Math.floor((endDate - nowDate) / 3600000);

          if (hourGap < 0) {
            continue;
          }

          if (deadline[subjectCode].lecture.remainingTime > hourGap) {
            deadline[subjectCode].lecture.remainingTime = hourGap;
            deadline[subjectCode].lecture.remainingCount = 1;
          }
          else if (deadline[subjectCode].lecture.remainingTime === hourGap) {
            deadline[subjectCode].lecture.remainingCount++;
          }

          deadline[subjectCode].lecture.totalCount++;
          isExistDeadline = true;
        }
      };

      /**
        * 과제 파싱 함수
        * @param {String} subjectCode
        * @param {Object} responseData
        * @param {String} homeworkType  HW(Personal Homework), TP(Team Project), QZ(Quiz)
        */
      const parseHomework = (subjectCode, responseData, homeworkType = 'HW') => {
        const nowDate = new Date();

        for (const homework of responseData) {
          if (homework.submityn === 'Y') {
            continue;
          }

          let endDate = new Date(homework.expiredate);
          let hourGap = Math.floor((endDate - nowDate) / 3600000);

          if (hourGap < 0) {
            if (!homework.reexpiredate) {
              continue;
            }

            // 추가 제출 기한
            endDate = new Date(homework.reexpiredate);
            hourGap = Math.floor((endDate - nowDate) / 3600000);

            if (hourGap < 0) {
              continue;
            }
          }

          if (homeworkType === 'HW') {
            if (deadline[subjectCode].homework.remainingTime > hourGap) {
              deadline[subjectCode].homework.remainingTime = hourGap;
              deadline[subjectCode].homework.remainingCount = 1;
            }
            else if (deadline[subjectCode].homework.remainingTime === hourGap) {
              deadline[subjectCode].homework.remainingCount++;
            }

            deadline[subjectCode].homework.totalCount++;
          }
          else if (homeworkType === 'TP') {
            if (deadline[subjectCode].teamProject.remainingTime > hourGap) {
              deadline[subjectCode].teamProject.remainingTime = hourGap;
              deadline[subjectCode].teamProject.remainingCount = 1;
            }
            else if (deadline[subjectCode].teamProject.remainingTime === hourGap) {
              deadline[subjectCode].teamProject.remainingCount++;
            }

            deadline[subjectCode].teamProject.totalCount++;
          }
          else if (homeworkType === 'QZ') {
            if (deadline[subjectCode].quiz.remainingTime > hourGap) {
              deadline[subjectCode].quiz.remainingTime = hourGap;
              deadline[subjectCode].quiz.remainingCount = 1;
            }
            else if (deadline[subjectCode].quiz.remainingTime === hourGap) {
              deadline[subjectCode].quiz.remainingCount++;
            }

            deadline[subjectCode].quiz.totalCount++;
          }
          isExistDeadline = true;
        }
      };

      // 해당 과목의 마감 정보 얻기
      await axios.all(promises).then((results) => {
        for (const response of results) {
          const subjectCode = JSON.parse(response.config.data).selectSubj;

          switch (response.config.url) {
            case '/std/lis/evltn/SelectOnlineCntntsStdList.do':
              parseLecture(subjectCode, response.data);
              break;

            case '/std/lis/evltn/TaskStdList.do':
              parseHomework(subjectCode, response.data, 'HW');
              break;

            case '/std/lis/evltn/PrjctStdList.do':
              parseHomework(subjectCode, response.data, 'TP');
              break;

            case '/std/lis/evltn/AnytmQuizStdPage.do':
              parseHomework(subjectCode, response.data, 'QZ');
              break;
          }
        }
      });

      // 마감이 빠른 순으로 정렬
      const sortedDeadline = Object.values(deadline).sort((left, right) => {
        const minLeft = left.lecture.remainingTime < left.lecture.remainingTime ? left.lecture : left.homework;
        const minRight = right.lecture.remainingTime < right.lecture.remainingTime ? right.lecture : right.homework;

        if (minLeft.remainingTime !== minRight.remainingTime) {
          return minLeft.remainingTime - minRight.remainingTime;
        }

        if (minLeft.remainingCount !== minRight.remainingCount) {
          return minRight.remainingCount - minLeft.remainingCount;
        }

        return (right.lecture.remainingCount + right.homework.remainingCount) - (left.lecture.remainingCount + left.homework.remainingCount);
      });

      // 내용 생성 함수
      const createContent = (name, info) => {
        if (info.remainingTime === Infinity) {
          return `<span style="color: green" class="remain-none">남아있는 ${name}가 없습니다!</span>`;
        }

        const remainingDay = Math.floor(info.remainingTime / 24);
        const remainingHour = info.remainingTime % 24;

        if (remainingDay === 0) {
          if (remainingHour === 0) {
            return `<span style="color: red; font-weight: bold" class="remain-soon">${info.totalCount}개의 ${name} 중 ${info.remainingCount}개가 곧 마감입니다. 😱</span>`;
          }
          else {
            return `<span style="color: red; font-weight: bolder" class="remain-hour">${info.totalCount}개의 ${name} 중 <strong>${info.remainingCount}개</strong>가 <strong>${remainingHour}시간 후</strong> 마감입니다. 😭</span>`;
          }
        }
        else if (remainingDay === 1) {
          return `<span style="color: red" class="remain-today">${info.totalCount}개의 ${name} 중 <strong>${info.remainingCount}개</strong>가 <strong>1일 후</strong> 마감입니다. 😥</span>`;
        }
        else {
          return `<span class="will-remain">${info.totalCount}개의 ${name} 중 <strong>${info.remainingCount}개</strong>가 <strong>${remainingDay}일 후</strong> 마감입니다.</span>`;
        }
      };

      // HTML 코드 생성
      const trCode = sortedDeadline.reduce((acc, cur) => {
        acc += `
           <tr style="border-bottom: 1px solid #dce3eb; height: 30px">
             <td style="font-weight: bold">
               <span style="cursor: pointer" onclick="appModule.goLctrum('${cur.yearSemester}', '${cur.subjectCode}')">${cur.subjectName}</span>
             </td>
             <td>
               <span style="cursor: pointer" onclick="appModule.goLctrumBoard('/std/lis/evltn/OnlineCntntsStdPage.do', '${cur.yearSemester}', '${cur.subjectCode}')">
                 ${createContent('강의', cur.lecture)}
               </span>
             </td>
             <td>
               <span style="cursor: pointer" onclick="appModule.goLctrumBoard('/std/lis/evltn/TaskStdPage.do', '${cur.yearSemester}', '${cur.subjectCode}')">
                 ${createContent('과제', cur.homework)}
               <span>
             </td>
             <td>
               <span style="cursor: pointer" onclick="appModule.goLctrumBoard('/std/lis/evltn/PrjctStdPage.do', '${cur.yearSemester}', '${cur.subjectCode}')">
                 ${createContent('팀 프로젝트', cur.teamProject)}
               <span>
             </td>
             <td>
               <span style="cursor: pointer" onclick="appModule.goLctrumBoard('/std/lis/evltn/AnytmQuizStdPage.do', '${cur.yearSemester}', '${cur.subjectCode}')">
                 ${createContent('퀴즈', cur.quiz)}
               <span>
             </td>
           </tr>
         `;

        return acc;
      }, '');

      // 렌더링
      if (isExistDeadline) {
        $('#yes-deadline > tbody').html(trCode);
        $('#yes-deadline').css('display', 'table');
        $('#no-deadline').css('display', 'none');
      }
      else {
        $('#yes-deadline').css('display', 'none');
        $('#no-deadline').css('display', 'block');
      }
    };

    appModule.$watch('atnlcSbjectList', (watchValue) => {
      updateDeadline(watchValue);
    });

    // 모든 정보를 불러올 때까지 대기
    const waitTimer = setInterval(() => {
      if (appModule && appModule.atnlcSbjectList.length > 0) {
        clearInterval(waitTimer);
        updateDeadline(appModule.atnlcSbjectList);
      }
    }, 100);
  })();
};
