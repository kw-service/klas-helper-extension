export interface Major {
  code: string;
  name: string;
}

export interface FetchMajorsRequestData {
  year: number | string;
  semester: string;
  departmentCode: string;
}

function parseMajor(data: any): Major {
  return {
    code: data.code,
    name: data.codeName1,
  };
}

/**
 * 광운대학교의 전공 목록을 가져옵니다.
 */
export async function fetchMajors(requestData: FetchMajorsRequestData): Promise<Major[]> {
  const response = await fetch('/std/cps/atnlc/CmmnMagerCodeList.do', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      selectYear: requestData.year,
      selecthakgi: requestData.semester,
      selecthakgwa: requestData.departmentCode,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch majors. Status: ${response.status}`);
  }

  return (await response.json()).map(parseMajor);
}
