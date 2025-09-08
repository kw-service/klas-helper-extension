import { type EverytimeLecture, getEverytimeLectures } from '@klas-helper/data';
import { Button, Card, Col, ConfigProvider, Empty, Input, Radio, Rate, Row, Select, Table, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  type CommonSubject,
  type Department,
  type FetchLecturesRequestData,
  type Lecture,
  type Major,
  fetchCommonSubjects,
  fetchDepartments,
  fetchLectures,
  fetchMajors,
} from '../../apis';
import './UniversitySyllabus.scss';

const currentYear = new Date().getFullYear();
const currentSemester = new Date().getMonth() < 7 ? '1' : '2';

export function UniversitySyllabus() {
  const [messageApi, contextHolder] = message.useMessage();

  const { control, watch, handleSubmit } = useForm<FetchLecturesRequestData>({
    defaultValues: {
      year: currentYear.toString(),
      semester: currentSemester,
      enrollmentStatus: 'all',
      commonSubjectCode: '',
      departmentCode: '',
      majorCode: '',
    },
  });

  const watchedDepartmentCode = watch('departmentCode') ?? '';

  const [commonSubjects, setCommonSubjects] = useState<CommonSubject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [majors, setMajor] = useState<Major[]>([]);

  // 초기 데이터 가져오기
  useEffect(() => {
    fetchCommonSubjects().then(setCommonSubjects);
    fetchDepartments({ year: currentYear, semester: currentSemester }).then(setDepartments);
  }, []);

  // 학과 변경 시 전공 목록 가져오기
  useEffect(() => {
    fetchMajors({ year: currentYear, semester: currentSemester, departmentCode: watchedDepartmentCode }).then(setMajor);
  }, [watchedDepartmentCode]);

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [everytimeLecturesData, setEverytimeLecturesData] = useState<EverytimeLecture[]>([]);

  // 에브리타임 강의평 데이터 비동기 로딩
  useEffect(() => {
    getEverytimeLectures()
      .then(setEverytimeLecturesData)
      .catch((error) => {
        console.error('Failed to load everytime lectures:', error);
      });
  }, []);

  // 에브리타임 강의평 데이터 맵 생성
  const everytimeLecturesMap = useMemo(() => {
    const map = new Map<string, EverytimeLecture>();

    for (const everytimeLecture of everytimeLecturesData) {
      map.set(`${everytimeLecture.name}-${everytimeLecture.professor}`, everytimeLecture);
    }

    return map;
  }, [everytimeLecturesData]);

  const transformedLectures = lectures.map((lecture) => ({
    ...lecture,
    key: `${lecture.majorCode}-${lecture.grade}-${lecture.code}-${lecture.classNumber}`,
    creditsAndClassHours: `${lecture.credits} / ${lecture.classHours}`,
    everytimeLecture: everytimeLecturesMap.get(`${lecture.name}-${lecture.professorName}`) ?? null,
  }));

  const onSubmit = handleSubmit(async (data) => {
    // 서버 부하 문제로 모든 강의 계획서 검색 금지
    if (data.enrollmentStatus === 'all' && !data.lectureName && !data.professorName && !data.commonSubjectCode && !data.departmentCode) {
      messageApi.error('과목명 또는 교수명을 입력하지 않은 경우 반드시 공통 과목이나 학과를 선택하셔야 합니다');
      return;
    }

    setIsLoading(true);

    const respondedLectures = await fetchLectures(data);

    setLectures(respondedLectures);
    setIsLoading(false);
  });

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBorderSecondary: '#dfdfdf',
          colorTextDisabled: 'rgba(0, 0, 0, 0.4)',
        },
        components: {
          Table: {
            headerBg: '#f5f5f5',
          },
        },
      }}
    >
      {contextHolder}
      <form className="helper-form" onSubmit={onSubmit}>
        <Card>
          <Row gutter={[28, 20]}>
            <Col span={12}>
              <label className="helper-title">년도 / 학기</label>
              <div className="helper-control">
                <Controller
                  control={control}
                  name="year"
                  render={({ field }) => (
                    <Select
                      style={{ width: 120 }}
                      options={Array.from({ length: 11 }).map((_, index) => ({
                        value: `${currentYear - index}`,
                        label: `${currentYear - index}년`,
                      }))}
                      {...field}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="semester"
                  render={({ field }) => (
                    <Select
                      style={{ width: 120 }}
                      options={[
                        { value: '1', label: '1학기' },
                        { value: '3', label: '여름학기' },
                        { value: '2', label: '2학기' },
                        { value: '4', label: '겨울학기' },
                      ]}
                      {...field}
                    />
                  )}
                />
              </div>
            </Col>
            <Col span={12}>
              <label className="helper-title">수강 여부</label>
              <div className="helper-control">
                <Controller
                  control={control}
                  name="enrollmentStatus"
                  render={({ field }) => (
                    <Radio.Group {...field}>
                      <Radio value="all">전체</Radio>
                      <Radio value="my">내 과목</Radio>
                    </Radio.Group>
                  )}
                />
              </div>
            </Col>
            <Col span={12}>
              <label className="helper-title">과목명</label>
              <div className="helper-control">
                <Controller
                  control={control}
                  name="lectureName"
                  render={({ field }) => <Input {...field} />}
                />
              </div>
            </Col>
            <Col span={12}>
              <label className="helper-title">교수명</label>
              <div className="helper-control">
                <Controller
                  control={control}
                  name="professorName"
                  render={({ field }) => <Input {...field} />}
                />
              </div>
            </Col>
            <Col span={8}>
              <label className="helper-title">공통 과목</label>
              <div className="helper-control">
                <Controller
                  control={control}
                  name="commonSubjectCode"
                  render={({ field }) => (
                    <Select
                      style={{ width: '100%' }}
                      options={[
                        { value: '', label: '- 전체 -' },
                        ...commonSubjects.map((item) => ({ value: item.code, label: item.name })),
                      ]}
                      {...field}
                    />
                  )}
                />
              </div>
            </Col>
            <Col span={8}>
              <label className="helper-title">학과</label>
              <div className="helper-control">
                <Controller
                  control={control}
                  name="departmentCode"
                  render={({ field }) => (
                    <Select
                      style={{ width: '100%' }}
                      options={[
                        { value: '', label: '- 전체 -' },
                        ...departments.map((item) => ({ value: item.code, label: item.name })),
                      ]}
                      {...field}
                    />
                  )}
                />
              </div>
            </Col>
            <Col span={8}>
              <label className="helper-title">전공</label>
              <div className="helper-control">
                <Controller
                  control={control}
                  name="majorCode"
                  render={({ field }) => (
                    <Select
                      style={{ width: '100%' }}
                      options={[
                        { value: '', label: '- 전체 -' },
                        ...majors.map((item) => ({ value: item.code, label: item.name })),
                      ]}
                      {...field}
                    />
                  )}
                />
              </div>
            </Col>
          </Row>
        </Card>
        <div style={{ display: 'flex', justifyContent: 'right', marginTop: 8 }}>
          <Button type="primary" htmlType="submit">조회</Button>
        </div>
        <div style={{ marginTop: 32 }}>
          <Table
            className="helper-table"
            columns={[
              { title: '학정번호', dataIndex: 'key', align: 'center' },
              {
                title: '과목명',
                dataIndex: 'name',
                align: 'center',
                render: (name: string, lecture) => {
                  if (!lecture.description) {
                    return `${name} (미입력)`;
                  }

                  if (lecture.isClosed) {
                    return `${name} (폐강)`;
                  }

                  return name;
                },
              },
              { title: '이수 구분', dataIndex: 'classification', align: 'center' },
              { title: '학점 / 시간', dataIndex: 'creditsAndClassHours', align: 'center' },
              { title: '교수명', dataIndex: 'professorName', align: 'center' },
              { title: '연락처', dataIndex: 'contact', align: 'center' },
              {
                title: '강의평 (everytime.kr)\n과제 / 조모임 / 성적',
                dataIndex: 'everytimeLecture',
                align: 'center',
                render: (everytimeLecture: EverytimeLecture | null) => {
                  if (!everytimeLecture || everytimeLecture.rate.count < 5) {
                    return '-';
                  }

                  const assignments = [...(everytimeLecture.details.find((detail) => detail.name === '과제')?.items ?? [])];
                  const teamProjects = [...(everytimeLecture.details.find((detail) => detail.name === '조모임')?.items ?? [])];
                  const scores = [...(everytimeLecture.details.find((detail) => detail.name === '성적')?.items ?? [])];

                  const assignmentText = assignments.sort((a, b) => b.count - a.count)[0]?.text ?? '-';
                  const teamProjectText = teamProjects.sort((a, b) => b.count - a.count)[0]?.text ?? '-';
                  const scoreText = scores.sort((a, b) => b.count - a.count)[0]?.text ?? '-';

                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                        <Rate
                          className="helper-rate"
                          defaultValue={everytimeLecture.rate.average}
                          disabled={true}
                          allowHalf={true}
                        />
                        <a
                          href={`https://everytime.kr/lecture/view/${everytimeLecture.id}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => event.stopPropagation()}
                        >
                          🔗
                        </a>
                      </div>
                      <div>
                        {`${assignmentText} / ${teamProjectText} / ${scoreText}`}
                      </div>
                    </div>
                  );
                },
              },
            ]}
            dataSource={transformedLectures}
            loading={isLoading}
            rowClassName={(lecture) => {
              if (!lecture.description) {
                return 'helper-missing';
              }

              if (lecture.isClosed) {
                return 'helper-closed';
              }

              return '';
            }}
            size="small"
            pagination={false}
            bordered={true}
            locale={{
              emptyText: () => (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="조회된 데이터가 없습니다" />
              ),
            }}
            onRow={(lecture) => ({
              onClick: () => {
                if (!lecture.description) {
                  messageApi.info('강의 계획서 정보가 없습니다');
                  return;
                }

                if (lecture.isClosed) {
                  messageApi.info('폐강된 강의입니다');
                  return;
                }

                const id = `U${lecture.year}${lecture.semester}${lecture.code}${lecture.majorCode}${lecture.classNumber}${lecture.grade}`;

                window.open(
                  `https://klas.kw.ac.kr/std/cps/atnlc/popup/LectrePlanStdView.do?selectSubj=${id}`,
                  '',
                  'width=1000, height=800, scrollbars=yes'
                );
              },
            })}
          />
        </div>
      </form>
    </ConfigProvider>
  );
}
