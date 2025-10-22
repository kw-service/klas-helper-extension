export interface Department {
  code: string;
  name: string;
}

export interface FetchDepartmentsRequestData {
  year: number | string;
  semester: string;
}

function parseDepartment(data: any): Department {
  return {
    code: data.classCode,
    name: data.openMajorName,
  };
}

/**
 * 광운대학교의 학과 목록을 가져옵니다.
 */
export async function fetchDepartments(requestData: FetchDepartmentsRequestData): Promise<Department[]> {
  const response = await fetch('/std/cps/atnlc/CmmnHakgwaList.do', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      selectYear: requestData.year,
      selecthakgi: requestData.semester,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch departments. Status: ${response.status}`);
  }

  return (await response.json()).map(parseDepartment);
}
