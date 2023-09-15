export interface Lecture {
  year: string;
  semester: string;
  majorCode: string;
  grade: string;
  code: string;
  classNumber: string;
  name: string;
  professorName: string;
  classification: string;
  classHours: number;
  credits: number;
  contact: string;
  description: string;
  isClosed: boolean;
  introVideoUrl: string;
}

export interface FetchLecturesRequestData {
  year: number | string;
  semester: string;
  enrollmentStatus: string;
  lectureName?: string;
  professorName?: string;
  commonSubjectCode?: string;
  departmentCode?: string;
  majorCode?: string;
}

function parseLecture(data: any): Lecture {
  return {
    year: data.thisYear,
    semester: data.hakgi,
    majorCode: data.openMajorCode,
    grade: data.openGrade,
    code: data.openGwamokNo,
    classNumber: data.bunbanNo,
    name: data.gwamokKname,
    professorName: data.memberName,
    classification: data.codeName1,
    classHours: data.sisuNum,
    credits: data.hakjumNum,
    contact: data.telNo ?? '',
    description: data.summary ?? '',
    isClosed: Boolean(data.closeOpt),
    introVideoUrl: data.videoUrl ?? '',
  };
}

/**
 * 광운대학교의 강의 목록을 가져옵니다.
 */
export async function fetchLectures(requestData: FetchLecturesRequestData): Promise<Lecture[]> {
  const response = await fetch('/std/cps/atnlc/LectrePlanStdList.do', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      selectYear: requestData.year,
      selecthakgi: requestData.semester,
      selectRadio: requestData.enrollmentStatus,
      selectText: requestData.lectureName ?? '',
      selectProfsr: requestData.professorName ?? '',
      cmmnGamok: requestData.commonSubjectCode ?? '',
      selecthakgwa: requestData.departmentCode ?? '',
      selectMajor: requestData.majorCode ?? '',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch lectures. Status: ${response.status}`);
  }

  return (await response.json()).map(parseLecture);
}
