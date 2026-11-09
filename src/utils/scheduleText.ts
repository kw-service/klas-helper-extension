/**
 * 강의실 상단의 시간표 문구(예: "월 5,6교시/비211, 화 5,6교시/비211")를 해석해
 * 같은 교시·장소끼리 요일을 묶어 줄이는 유틸리티
 */

/** 요일 표시 순서 */
const DAYS = '월화수목금토일';

/** "월 5,6교시/비211, 화 ..." 에서 항목 사이의 쉼표만 나눕니다 (교시 목록 안의 쉼표는 나누지 않음) */
const ENTRY_SEPARATOR = new RegExp(`,\\s*(?=[${DAYS}][\\s·])`);

/** 한 항목: 요일(여러 개면 ·로 연결) + 교시 목록 + 장소(비어 있을 수 있음) */
const ENTRY_PATTERN = new RegExp(`^([${DAYS}](?:·[${DAYS}])*)\\s+(\\d+(?:,\\d+)*)교시(?:/(.*))?$`);

interface ScheduleGroup {
  days: string[];
  periods: string;
  room: string;
}

/**
 * 시간표 문구를 요일·교시·장소로 나누고, 교시와 장소가 같은 항목의 요일을 묶어 줄입니다.
 *
 * - "월 5,6교시/비211, 화 5,6교시/비211, 수 5,6교시/비211" → "월·화·수 5,6교시/비211"
 * - "월 6교시/새빛203, 수 5교시/새빛203" → 교시가 달라 그대로 유지
 * - 해석하지 못하는 형식이거나 줄어들지 않으면 원문을 그대로 돌려줍니다.
 * - 이미 줄인 문구를 다시 넣어도 같은 결과가 나옵니다.
 */
export const compressScheduleText = (text: string): string => {
  const source = text.trim();

  if (!source) {
    return text;
  }

  const groups = new Map<string, ScheduleGroup>();

  for (const entry of source.split(ENTRY_SEPARATOR)) {
    const match = entry.trim().match(ENTRY_PATTERN);

    if (!match) {
      return text;
    }

    const [, dayText, periods, rawRoom = ''] = match;
    const room = rawRoom.trim();
    const key = `${periods}/${room}`;
    const group = groups.get(key) ?? { days: [], periods, room };

    for (const day of dayText.split('·')) {
      if (!group.days.includes(day)) {
        group.days.push(day);
      }
    }

    groups.set(key, group);
  }

  const compressed = [...groups.values()]
    .map((group) => {
      const days = [...group.days].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b)).join('·');
      return `${days} ${group.periods}교시${group.room ? `/${group.room}` : ''}`;
    })
    .join(', ');

  return compressed.length < source.length ? compressed : text;
};
