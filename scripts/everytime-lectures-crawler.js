/**
 * 에브리타임 강의평 자동 수집 스크립트
 *
 * 사용 방법
 * 1. 에브리타임 사이트에 접속 후 로그인을 합니다.
 * 2. F12를 눌러 개발자 도구를 열고 Console 탭을 선택합니다.
 * 3. 아래 코드의 주석을 참고하여 필요한 데이터를 입력합니다.
 * 4. 이 파일의 모든 내용을 복사한 후 Console 탭에 붙여 넣고 엔터를 누르면 됩니다.
 * 5. 수집에는 강의평 하나당 약 1초가 소요되며, 수집이 완료되면 JSON 파일로 저장됩니다.
 */

/**
 * 강의평을 수집할 강의의 이름 목록을 배열로 입력합니다. `lecture-names.json` 파일에 광운대학교 강의 정보가 있으니 참고하세요.
 */
const lectureNames = [];

async function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function saveAsFile(name, data) {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = name;
  a.click();

  URL.revokeObjectURL(url);
}

class Everytime {
  static hostUrl = 'https://api.everytime.kr';

  static async searchLectures(params) {
    const { keyword, offset = 0, limit = 20 } = params;

    const response = await fetch(`${this.hostUrl}/find/lecture/list/keyword`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,ko-KR;q=0.8,ko;q=0.7',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `campusId=0&field=name&keyword=${keyword}&limit=${limit}&offset=${offset}`,
      referrer: 'https://everytime.kr',
      referrerPolicy: 'origin',
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return (await response.json()).result.lectures;
  }

  static async getLecture(lectureId) {
    const response = await fetch(`${this.hostUrl}/find/lecture`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,ko-KR;q=0.8,ko;q=0.7',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `id=${lectureId}`,
      referrer: 'https://everytime.kr',
      referrerPolicy: 'origin',
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return (await response.json()).result;
  }
}

const everytimeLectures = {};

(async () => {
  console.clear();
  console.log('에브리타임 강의평 자동 수집 스크립트 실행을 시작합니다.');
  console.log(`수집할 강의 목록은 총 ${lectureNames.length.toLocaleString()}개 입니다.`);

  for (let i = 0; i < lectureNames.length; i++) {
    const lectureName = lectureNames[i];
    let offset = 0;
    const limit = 20;

    console.log(`검색어 "${lectureName}"로 진행 중입니다. (${i + 1}/${lectureNames.length})`);

    while (true) {
      const simpleLectures = await Everytime.searchLectures({ keyword: lectureName, offset, limit });

      console.log(`검색어 "${lectureName}"에 대한 강의평 ${simpleLectures.length}개를 수집했습니다. (offset: ${offset})`);

      if (simpleLectures.length === 0) {
        break;
      }

      for (const simpleLecture of simpleLectures) {
        if (simpleLecture.name !== lectureName || !simpleLecture.professor || !simpleLecture.rate) {
          continue;
        }

        if (everytimeLectures[simpleLecture.id]) {
          continue;
        }

        const fullLecture = await Everytime.getLecture(simpleLecture.id);

        console.log(`"${simpleLecture.professor}" 교수님의 "${simpleLecture.name}" 강의의 정보를 수집했습니다. (id: ${simpleLecture.id})`);

        everytimeLectures[simpleLecture.id] = {
          id: simpleLecture.id,
          name: simpleLecture.name,
          professor: simpleLecture.professor,
          rate: fullLecture.review.rate,
          details: [
            ...fullLecture.review.objectiveDetails,
            ...fullLecture.review.subjectiveDetails,
          ],
        };

        await sleep(1000);
      }

      offset += simpleLectures.length;
    }

    await sleep(1000);
  }

  console.log('에브리타임 강의평 자동 수집이 완료되었습니다.');

  saveAsFile('everytime-lectures.json', Object.values(everytimeLectures));
})();
