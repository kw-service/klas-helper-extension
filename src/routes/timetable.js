/**
 * 페이지 이름: 수업시간표
 * 페이지 주소: https://klas.kw.ac.kr/std/cps/atnlc/TimetableStdPage.do
 */

import { addListenerByTimer } from '../utils/dom';
import {
  VIRTUAL_ROW_FLAG,
  fetchUnscheduledLectures,
  guardGoLctrum,
  hasVirtualRows,
  mergeVirtualRows,
} from '../utils/unscheduledLectures';

const lectureStartTime = {
  0: '08:00',
  1: '09:00',
  2: '10:30',
  3: '12:00',
  4: '13:30',
  5: '15:00',
  6: '16:30',
  7: '18:00',
  8: '18:50',
  9: '19:40',
  10: '00:30',
  11: '21:20',
};

const lectureEndTime = {
  0: '08:50',
  1: '10:15',
  2: '11:45',
  3: '13:15',
  4: '14:45',
  5: '16:15',
  6: '17:45',
  7: '18:45',
  8: '19:35',
  9: '20:25',
  10: '21:15',
  11: '22:05',
};

export const handleTimeTable = () => {
  const timeTable = appModule.$data.timeTableList;
  const lectureList = [];

  // 학기를 바꾸면 Vue가 칸을 재사용하면서 이전 학기의 시간 표시가 남을 수 있으므로 모두 지우고 다시 그립니다
  $('.scheduletb td div > span.time').remove();

  // 원본 소스에서 실제 그려지는 시간표를 파싱합니다
  for (const item of timeTable) {
    // KLAS Helper가 추가한 가상 행(현장실습 등)은 교시가 없으므로 건너뜁니다
    if (item[VIRTUAL_ROW_FLAG]) {
      continue;
    }

    for (let i = 1; i < 10; i++) {
      const subjNm = item[`wtSubjNm_${i}`];
      const subjPrintSeq = item[`wtSubjPrintSeq_${i}`];
      const startTime = item['wtTime']; // 시작시간
      const spanTime = item[`wtSpan_${i}`]; // 강의시간
      if (subjNm !== undefined) {
        lectureList.push({
          subjNm,
          subjPrintSeq,
          startTime,
          spanTime,
        });
      }
    }
  }

  // 파싱한 데이터를 통해 표에 그려진 값을 찾아가고, 거기에 시간을 추가합니다.
  for (const item of lectureList) {
    const subjPrintSeq = item.subjPrintSeq;
    const startTime = item.startTime;
    const spanTime = item.spanTime;
    const className = '.namecol' + String(subjPrintSeq).padStart(2, '0');

    $(className).each(function (idx, element) {
      const endTime = startTime + parseInt($(element).attr('class').split('lessontime')[1]) - 1;
      const currentLectureTime = parseInt($(element).closest('tr').eq(0).find('.time').eq(0).text());
      // 이미 시간이 그려진 강의이거나, 해당되는 강의 시간이 아니라면 그냥 넘어갑니다.
      if ($(element).find('span').length > 0 || currentLectureTime !== startTime) {
        // $(element).find("span").remove();
        return;
      }

      if (currentLectureTime !== 30) {
        $(element).append(`<span class="time">${lectureStartTime[currentLectureTime]} ~ ${lectureEndTime[currentLectureTime + spanTime - 1]}</span>`);
      }
    });
  }
};

/**
 * 수업시간표 페이지에서 KLAS 시간표에 빠진 과목(현장실습, 교류 과목 등)을 가상 행으로 채웁니다.
 * 조회 학기가 바뀔 때마다 timeTableList가 교체되므로 $watch로 감지합니다.
 */
const fillUnscheduledLectures = () => {
  guardGoLctrum(appModule);

  let unscheduled = null;
  let loading = null;

  // 보완 데이터를 불러옵니다. 실패하면 다음 시간표 조회 때 다시 시도합니다 (동시에 한 번만 요청)
  const load = () => {
    if (!loading) {
      loading = fetchUnscheduledLectures()
        .then((result) => { unscheduled = result; })
        .catch((error) => { console.error('[KLAS Helper] 시간표 보완 데이터를 불러오지 못했습니다.', error); })
        .finally(() => { loading = null; });
    }
    return loading;
  };

  const apply = () => {
    const timeTableList = appModule.$data.timeTableList;
    if (hasVirtualRows(timeTableList)) {
      return;
    }

    if (!unscheduled) {
      load().then(() => {
        if (unscheduled) {
          apply();
        }
      });
      return;
    }

    const yearhakgi = `${appModule.$data.searchYear},${appModule.$data.searchHakgi}`;
    const entry = unscheduled.get(yearhakgi);
    const lectures = entry ? entry.lectures : [];

    if (lectures.length === 0) {
      return;
    }

    appModule.timeTableList = mergeVirtualRows(timeTableList, lectures, yearhakgi);
  };

  appModule.$watch('timeTableList', apply);
  apply();
};

/** Vue가 시간표를 그린 뒤 강의 시간을 표시합니다 (홈 화면에서도 사용) */
export const drawLectureTimesLater = () => { setTimeout(handleTimeTable, 700); };

export default () => {
  drawLectureTimesLater();
  addListenerByTimer(() => appModule?.$data?.timeTableList?.length > 0, fillUnscheduledLectures);
};
