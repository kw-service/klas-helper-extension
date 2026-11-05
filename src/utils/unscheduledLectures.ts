/**
 * KLAS 시간표에 반영되지 않는 수강 과목(현장실습, 교류 과목 등)을 보완하는 유틸리티
 *
 * KLAS 홈 화면과 수업시간표 페이지는 "시간표 데이터가 있는 학기"만 학기 목록에 표시하고,
 * 현장실습처럼 요일/교시가 없는 과목은 시간표에서 아예 빠집니다.
 * 수강/성적조회 데이터(AtnlcScreSungjukInfo.do)에는 해당 과목이 존재하므로,
 * 두 데이터를 비교해 빠진 학기와 과목을 찾아 시간표에 가상 행으로 그려 줍니다.
 */

declare var axios: any;

/** 수강/성적조회에서 가져온 과목 정보 */
export interface UnscheduledLecture {
  name: string;
  department: string;
  classification: string;
  credit: number;
}

/** 수강/성적조회에는 있지만 시간표 학기 목록에는 없는 학기 */
export interface MissingSemester {
  year: string;
  hakgi: string;
  /** KLAS 학기 목록과 같은 형식 ("2026,2") */
  value: string;
  /** KLAS 학기 목록과 같은 형식 ("2026년도 2학기") */
  label: string;
  lectures: UnscheduledLecture[];
}

interface KlasYearhakgi {
  value: string;
  label: string;
  subjList?: { value: string; label: string; name: string }[];
}

interface KlasSungjukSemester {
  thisYear: string;
  hakgi: string;
  sungjukList: {
    gwamokKname: string;
    hakgwa: string;
    codeName1: string;
    hakjumNum: number;
  }[];
}

/** 시간표 행에서 KLAS Helper가 만든 가상 행을 구분하기 위한 플래그 */
export const VIRTUAL_ROW_FLAG = 'klasHelperVirtual';

/** 학기 값("2026,2")을 키로 하는, 시간표에 없는 과목 목록 */
export type UnscheduledMap = Map<string, { label: string; isMissingSemester: boolean; lectures: UnscheduledLecture[] }>;

/** 마지막 계산 결과를 저장하는 localStorage 키 (다음 방문 때 네트워크 응답을 기다리지 않고 바로 적용) */
const CACHE_KEY = 'klasHelper.unscheduledLectures';

/** 홈 화면에서 기본으로 보여 줄 가상 학기 값을 저장하는 localStorage 키 (content-style에서 깜빡임 방지용으로 읽음) */
export const PREFERRED_YEARHAKGI_KEY = 'klasHelper.preferredYearhakgi';

/** content-style이 홈 화면 시간표를 잠시 숨기기 위해 넣는 style 요소의 id */
export const TIMETABLE_HIDE_STYLE_ID = 'klas-helper-timetable-hide';

const SUNGJUK_API = '/std/cps/inqire/AtnlcScreSungjukInfo.do';
const YEARHAKGI_API = '/std/cmn/frame/YearhakgiAtnlcSbjectList.do';

const normalize = (text: unknown): string => String(text ?? '').replace(/\s+/g, '').trim();

const parseSemesterValue = (value: string): [string, string] => {
  const [year = '', hakgi = ''] = String(value).split(',');
  return [year.trim(), hakgi.trim()];
};

/** 학기 값("2026,2")을 내림차순 정렬하기 위한 비교 함수 */
export const compareSemesterDesc = (a: string, b: string): number => {
  const [ay, ah] = parseSemesterValue(a).map(Number);
  const [by, bh] = parseSemesterValue(b).map(Number);
  return (by - ay) || (bh - ah);
};

/**
 * 수강/성적조회 데이터와 KLAS 학기 목록을 불러와 시간표에 빠진 학기와 과목을 계산합니다.
 *
 * @param yearhakgiList KLAS 홈 화면의 학기 목록. 생략하면 직접 불러옵니다.
 * @returns 학기 값("2026,2")을 키로 하는, 시간표에 없는 과목 목록 (학기 전체가 없는 경우 isMissingSemester = true)
 */
export const fetchUnscheduledLectures = async (yearhakgiList?: KlasYearhakgi[]): Promise<UnscheduledMap> => {
  const [sungjukResponse, yearhakgiResponse] = await Promise.all([
    axios.post(SUNGJUK_API),
    yearhakgiList ? Promise.resolve({ data: yearhakgiList }) : axios.post(YEARHAKGI_API, {}),
  ]);

  const sungjuk: KlasSungjukSemester[] = Array.isArray(sungjukResponse.data) ? sungjukResponse.data : [];
  const knownSemesters: KlasYearhakgi[] = Array.isArray(yearhakgiResponse.data) ? yearhakgiResponse.data : [];

  const knownSubjects = new Map<string, Set<string>>();
  for (const semester of knownSemesters) {
    knownSubjects.set(semester.value, new Set((semester.subjList ?? []).map((subject) => normalize(subject.name))));
  }

  const result: UnscheduledMap = new Map();

  for (const semester of sungjuk) {
    const value = `${semester.thisYear},${semester.hakgi}`;
    const known = knownSubjects.get(value);
    const lectures = (semester.sungjukList ?? [])
      .filter((lecture) => !known || !known.has(normalize(lecture.gwamokKname)))
      .map((lecture) => ({
        name: String(lecture.gwamokKname ?? '').trim(),
        department: String(lecture.hakgwa ?? '').trim(),
        classification: String(lecture.codeName1 ?? '').trim(),
        credit: Number(lecture.hakjumNum) || 0,
      }));

    if (lectures.length === 0) {
      continue;
    }

    result.set(value, {
      label: `${semester.thisYear}년도 ${semester.hakgi}학기`,
      isMissingSemester: !known,
      lectures,
    });
  }

  return result;
};

/** 두 결과가 같은지 비교하기 위한 직렬화 */
export const serializeUnscheduled = (unscheduled: UnscheduledMap): string => JSON.stringify(Array.from(unscheduled));

/** 마지막 계산 결과를 localStorage에서 읽습니다. 없거나 깨져 있으면 null */
export const loadCachedUnscheduledLectures = (): UnscheduledMap | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }
    const result: UnscheduledMap = new Map();
    for (const [value, entry] of parsed) {
      if (typeof value === 'string' && entry && Array.isArray(entry.lectures)) {
        result.set(value, { label: String(entry.label ?? ''), isMissingSemester: !!entry.isMissingSemester, lectures: entry.lectures });
      }
    }
    return result;
  }
  catch (e) {
    return null;
  }
};

/** 계산 결과를 localStorage에 저장합니다 */
export const saveCachedUnscheduledLectures = (unscheduled: UnscheduledMap): void => {
  try {
    localStorage.setItem(CACHE_KEY, serializeUnscheduled(unscheduled));
  }
  catch (e) {
    // 저장 공간 부족 등은 무시 (다음 방문에 다시 계산)
  }
};

/** 홈 화면에서 기본으로 보여 줄 가상 학기를 기록합니다. null이면 기록을 지웁니다 */
export const setPreferredYearhakgi = (value: string | null): void => {
  try {
    if (value) {
      localStorage.setItem(PREFERRED_YEARHAKGI_KEY, value);
    }
    else {
      localStorage.removeItem(PREFERRED_YEARHAKGI_KEY);
    }
  }
  catch (e) {
    // 무시
  }
};

/** content-style이 숨겨 둔 시간표를 다시 보이게 합니다 */
export const revealTimetable = (): void => {
  document.getElementById(TIMETABLE_HIDE_STYLE_ID)?.remove();
};

/**
 * 시간표(timeTableList)에 그릴 수 있는 형태의 가상 행을 만듭니다.
 * 요일/교시가 없는 과목이므로 월~금 전체에 같은 과목을 표시합니다.
 */
export const buildVirtualTimeTableRows = (lectures: UnscheduledLecture[], yearhakgi: string, startNumber = 1): Record<string, unknown>[] => {
  return lectures.map((lecture, index) => {
    const row: Record<string, unknown> = {
      wtTime: startNumber + index,
      wtHasSchedule: 'Y',
      [VIRTUAL_ROW_FLAG]: true,
    };

    for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
      row[`wtSpan_${dayOfWeek}`] = 1;
      row[`wtMoreBackSpan_${dayOfWeek}`] = 'N';
      row[`wtMoreLine_${dayOfWeek}`] = 0;
      row[`wtSubjNm_${dayOfWeek}`] = lecture.name;
      row[`wtLocHname_${dayOfWeek}`] = lecture.department || '-';
      row[`wtProfNm_${dayOfWeek}`] = `${lecture.classification} ${lecture.credit}학점`.trim();
      row[`wtSubjPrintSeq_${dayOfWeek}`] = (index % 9) + 1;
      row[`wtSubj_${dayOfWeek}`] = null;
      row[`wtYearhakgi_${dayOfWeek}`] = yearhakgi;
    }

    return row;
  });
};

/** 시간표 목록에 가상 행이 포함되어 있는지 확인 */
export const hasVirtualRows = (timeTableList: unknown): boolean => {
  return Array.isArray(timeTableList) && timeTableList.some((row) => row && (row as any)[VIRTUAL_ROW_FLAG]);
};

/** 실제 KLAS 시간표에 수업이 하나라도 있는지 확인 */
export const hasScheduledRows = (timeTableList: unknown): boolean => {
  return Array.isArray(timeTableList) && timeTableList.some((row) => row && (row as any).wtHasSchedule === 'Y' && !(row as any)[VIRTUAL_ROW_FLAG]);
};

/**
 * 기존 시간표 목록에 가상 행을 합칩니다.
 * 실제 수업이 있으면 마지막 교시 다음 번호부터 이어서 붙이고,
 * 실제 수업이 없는 학기는 빈 교시 행을 모두 지우고 1번부터 가상 행만 보여 줍니다.
 */
export const mergeVirtualRows = (timeTableList: unknown[], lectures: UnscheduledLecture[], yearhakgi: string): unknown[] => {
  const realRows = (Array.isArray(timeTableList) ? timeTableList : []).filter((row) => !(row as any)?.[VIRTUAL_ROW_FLAG]);

  if (!hasScheduledRows(realRows)) {
    return buildVirtualTimeTableRows(lectures, yearhakgi, 1);
  }

  const lastNumber = realRows.reduce<number>((max, row) => Math.max(max, Number((row as any).wtTime) || 0), 0);
  return [...realRows, ...buildVirtualTimeTableRows(lectures, yearhakgi, lastNumber + 1)];
};

/**
 * Vue 인스턴스의 goLctrum 메서드를 감싸, 과목 코드가 없는 가상 행 클릭 시 강의실로 이동하지 않도록 막습니다.
 */
export const guardGoLctrum = (appModule: any): void => {
  if (!appModule || typeof appModule.goLctrum !== 'function' || appModule.goLctrum.klasHelperGuarded) {
    return;
  }

  const original = appModule.goLctrum;
  const guarded = function (this: unknown, yearhakgi: string, subj: string, ...rest: unknown[]) {
    if (!subj) {
      return undefined;
    }
    return original.call(this, yearhakgi, subj, ...rest);
  };
  (guarded as any).klasHelperGuarded = true;
  appModule.goLctrum = guarded;
};
