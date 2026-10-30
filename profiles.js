/* 사이트 성격(프로필) — 국제학교 과외 생성기 (2026-10-27)
   intl: 국내·해외 국제학교 × 10과목, 둘째 메뉴는 '커리큘럼'(specialty.js — IB·AP·IGCSE/A-Level·SAT·TOEFL·입학시험)
   각 항목: levels(학교 묶음), subjectsFor(묶음→과목), subjectsAll(과목 전체 순서), teacherSubjects(선생님 데이터에서 고를 과목), formSubjects, services(홈 카드) … */
const PROFILES = {
  intl: {
    levels: ['국내', '해외'],
    subjectsFor: () => ['수학', '영어', '에세이', '과학', '물리', '화학', '생물', '경제', 'SAT', '입학준비'],
    teacherSubjects: null,
    formSubjects: ['수학', '영어', '에세이·글쓰기', '과학', '물리', '화학', '생물', '경제', 'SAT', 'TOEFL·IELTS', '입학시험·편입', '대학 원서 에세이', '전과목 관리', '상담만 받아 보기'],
    quickExtra: [['대학 원서 에세이', '🎓', 'Common App·UCAS 에세이 구성과 첨삭']],
    services: [['💻', '화상 1:1', '해외 어디서든 시차에 맞춰 수업합니다. 화면에 과제와 풀이를 같이 띄워 놓고 진행합니다.'], ['🏠', '국내 방문', '제주·송도·서울·판교 등 국내 국제학교 학생은 방문 수업도 상담할 수 있습니다.'], ['📚', '커리큘럼별 내신', 'IB·AP·IGCSE·A-Level 과제와 시험 일정에 맞춰 학기 계획을 세웁니다.'], ['🎓', '입학·진학', '국제학교 입학·편입부터 SAT·TOEFL, 대학 원서 에세이까지 단계별로 준비합니다.']],
    tagSchools: '국내·해외 국제학교',
    subjectsNote: '수학·영어·에세이·과학부터 SAT·입학준비까지, 학교 커리큘럼(IB·AP·IGCSE·A-Level)에 맞춰 준비합니다.',
    homeTitle: '국제학교 학교별 1:1 과외 · IB·AP·IGCSE · 화상·방문',
    homeExtra: 'IB·AP·IGCSE·A-Level 내신, SAT·TOEFL, 입학·편입 준비',
    homeKw: '국제학교 과외, 국제학교 수학과외, 국제학교 영어과외, IB 과외, AP 과외, IGCSE 과외, A-Level 과외, SAT 과외, 국제학교 입학, 화상과외',
    desc: '국내·해외 국제학교 학교별 1:1 과외(화상·방문) — IB·AP·IGCSE·A-Level 내신, 에세이, SAT, 입학·편입 준비'
  }
};
for (const k of Object.keys(PROFILES)) {
  const P = PROFILES[k];
  const seen = new Set(); P.subjectsAll = [];
  for (const lv of P.levels) for (const s of P.subjectsFor(lv)) if (!seen.has(s)) { seen.add(s); P.subjectsAll.push(s); }
}
module.exports = { PROFILES };
