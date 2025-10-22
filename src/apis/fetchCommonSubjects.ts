export interface CommonSubject {
  code: string;
  name: string;
}

function parseCommonSubject(data: any): CommonSubject {
  return {
    code: data.code,
    name: data.codeName1,
  };
}

/**
 * 광운대학교의 공통 과목 목록을 가져옵니다.
 */
export async function fetchCommonSubjects(): Promise<CommonSubject[]> {
  const response = await fetch('/std/cps/atnlc/CmmnGamokList.do', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: '{}',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch common subjects. Status: ${response.status}`);
  }

  return (await response.json()).map(parseCommonSubject);
}
