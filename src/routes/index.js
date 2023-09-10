import handleEvaluation from './evaluation';
import handleHome from './home';
import handleLectureHome from './lecture-home';
import handleLenturePlan from './lecture-plan-std';
import handleLecturePlanView from './lecture-plan-view';
import handleLogin from './login';
import handleOnlineLecture from './online-lecture';
import handleRank from './rank';
import handleRootHomepage from './root';
import handleScore from './score';
import handleCalculateToeic from './score-toeic';
import handleSyllabus from './syllabus';
import handleSyllabusGraduate from './syllabus-graduate';
import handleTakeLecture from './take-lecture';
import handleTimeTable from './timetable';

export default {
  '/std/cmn/frame/Frame.do': handleHome,
  '/std/cps/atnlc/LectrePlanStdPage.do': handleSyllabus,
  '/std/cps/atnlc/popup/LectrePlanStdView.do': handleLecturePlanView,
  '/std/cps/atnlc/popup/LectrePlanStdNumPopup.do': handleLenturePlan,
  '/std/cps/atnlc/LectrePlanGdhlStdPage.do': handleSyllabusGraduate,
  '/std/cps/inqire/AtnlcScreStdPage.do': handleScore,
  '/std/cps/inqire/StandStdPage.do': handleRank,
  '/std/lis/evltn/LctrumHomeStdPage.do': handleLectureHome,
  '/std/cps/inqire/LctreEvlViewStdPage.do': handleEvaluation,
  '/std/lis/evltn/OnlineCntntsStdPage.do': handleOnlineLecture,
  '/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do': handleTakeLecture,
  '/std/cps/inqire/ToeicStdPage.do': handleCalculateToeic,
  '/std/cps/atnlc/TimetableStdPage.do': handleTimeTable,
  '/usr/cmn/login/LoginForm.do': handleLogin,
  '*': handleRootHomepage,
};
