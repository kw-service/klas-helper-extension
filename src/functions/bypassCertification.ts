declare var axios: any;
declare var appModule: any;
declare var lrnCerti: any;

/**
 * 인증 없이 온라인 강의를 수강할 수 있도록 합니다.
 */
export function bypassCertification() {
  if (!lrnCerti?.checkCerti) {
    return;
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
}
