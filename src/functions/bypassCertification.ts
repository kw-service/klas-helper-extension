declare var axios: any;
declare var appModule: any;
declare var lrnCerti: any;

/**
 * 인증 없이 온라인 강의를 수강할 수 있도록 합니다.
 */
export function bypassCertification() {
  if (!lrnCerti?.checkCerti) {
    alert('인증 기능을 제거하지 못했습니다.');
  }

  lrnCerti.checkCerti = async function (
    grcode: any,
    subj: any,
    year: any,
    hakgi: any,
    bunban: any,
    module: any,
    lesson: any,
    oid: any,
    starting: any,
    contentsType: any,
    weeklyseq: any,
    weeklysubseq: any,
    width: any,
    height: any,
    today: any,
    sdate: any,
    edate: any,
    ptype: any,
    totalTime: any,
    prog: any,
    gubun: any,
    ptime: any
  ) {
    this.grcode = grcode;
    this.subj = subj;
    this.year = year;
    this.hakgi = hakgi;
    this.weeklyseq = weeklyseq;
    this.gubun = gubun;
    this.certiGubun = '';

    await axios.post('/std/lis/evltn/CertiStdCheck.do', this.$data);

    if (gubun === 'C') {
      appModule.goViewCntnts(
        grcode,
        subj,
        year,
        hakgi,
        bunban,
        module,
        lesson,
        oid,
        starting,
        contentsType,
        weeklyseq,
        weeklysubseq,
        width,
        height,
        today,
        sdate,
        edate,
        ptype,
        totalTime,
        prog,
        ptime
      );
    }
  };

  alert([
    '인증 기능이 제거되었습니다.',
    '현재 학교 페이지가 지속적으로 업데이트가 되고 있어서 해당 기능이 적용되지 않을 수 있습니다.',
    '만약 문제가 발생할 경우 새로고침을 해주시고 해당 기능은 사용하지 않는 것을 권장 드립니다.',
  ].join('\n'));
}
