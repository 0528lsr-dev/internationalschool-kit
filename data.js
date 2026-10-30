/* 데이터 로드 — 국제학교(데이터/intl-schools-data.js) · 선생님(데이터/teachers-data.js + t/ 소개글, 선택)
   과외 생성기의 "시도 → 시군구" 자리를 "나라·시도 → 도시" 로 바꿔 쓴다. 코드 안 이름(sido·city)은 그대로 둔다.
   학교급 자리(t)는 국내 / 해외 두 가지 — 학교찾기 페이지가 두 장이 된다. */
const fs = require('fs');
const path = require('path');
const { esc } = require('./공용/lib');

const SCHOOLS_JS = path.join(__dirname, '데이터/intl-schools-data.js');
const TEACHERS_JS = path.join(__dirname, '데이터/teachers-data.js');   // 없으면 선생님 0명으로 만든다
const TEACHER_DIR = path.join(__dirname, '데이터/t');                     // 선택: {id}.html 소개글
const EXCLUDE_TEACHERS = new Set([]);

/* 묶음 순서 — 국내(시도) 다음 해외(나라). 목록에 없는 묶음은 맨 뒤에 가나다순 */
const SIDO_ORDER = ['제주', '인천', '서울', '경기', '부산', '대구', '대전', '광주', '울산', '경남',
  '싱가포르', '홍콩', '중국', '일본', '대만', '베트남', '태국', '말레이시아', '필리핀', '인도네시아', '인도', 'UAE', '카타르',
  '미국', '캐나다', '영국', '스위스'];
const SIDO_FULL = { 서울: '서울특별시', 경기: '경기도', 인천: '인천광역시', 부산: '부산광역시', 대구: '대구광역시', 광주: '광주광역시', 대전: '대전광역시', 제주: '제주특별자치도', 울산: '울산광역시', 경남: '경상남도' };
/* 학교가 적은 곳은 시도·나라 하나로 묶는다(지역 페이지에 학교 1곳만 있는 일을 줄인다). 학교 페이지에는 원래 위치(area)를 보여 준다 */
const GROUP_WHOLE = new Set(['제주', '인천', '서울', '경기', '부산', '대구', '대전', '광주', '울산', '경남', '미국', '영국', '캐나다', '스위스']);
const FLAG = { 싱가포르: '🇸🇬', 홍콩: '🇭🇰', 중국: '🇨🇳', 일본: '🇯🇵', 대만: '🇹🇼', 베트남: '🇻🇳', 태국: '🇹🇭', 말레이시아: '🇲🇾', 필리핀: '🇵🇭', 인도네시아: '🇮🇩', 인도: '🇮🇳',
  UAE: '🇦🇪', 카타르: '🇶🇦', 미국: '🇺🇸', 캐나다: '🇨🇦', 영국: '🇬🇧', 스위스: '🇨🇭' };

/* 과목 — 모든 학교 같은 10과목 (profiles.js 에서 바꿀 수 있다) */
const SUBJECTS = ['수학', '영어', '에세이', '과학', '물리', '화학', '생물', '경제', 'SAT', '입학준비'];
const subjectsFor = () => SUBJECTS;

/* "싱가포르 싱가포르" → sido=싱가포르, city=싱가포르 / "제주 영어교육도시" → sido=제주, city=영어교육도시 */
function splitRegion(r) {
  const parts = r.trim().split(/\s+/);
  return { sido: parts[0], city: parts.slice(1).join(' ') || parts[0], cityKey: (parts.slice(1).join('') || parts[0]) };
}

function loadSchools(opts = {}) {
  const levels = opts.levels || ['국내', '해외'];
  const subjFor = opts.subjectsFor || subjectsFor;
  const raw = fs.readFileSync(SCHOOLS_JS, 'utf8');
  const js = raw.slice(raw.indexOf('[', raw.indexOf('window.INTL_SCHOOLS')), raw.lastIndexOf(']') + 1);
  const arr = Function('"use strict";return ' + js)();          // 데이터 파일은 우리가 쓰는 파일이라 그대로 읽는다
  const used = new Set(), list = [];
  for (const x of arr) {
    if (!levels.includes(x.t)) continue;
    if (used.has(x.sn)) { console.log('  ⚠ 검색 이름(sn)이 겹침 — 뒤엣것을 뺀다:', x.sn); continue; }
    used.add(x.sn);
    const reg = splitRegion(x.r);
    const area = reg.city === reg.sido ? reg.sido : x.r;            // 화면에 보여 줄 위치 (예: 서울 서대문, 미국 매사추세츠)
    if (GROUP_WHOLE.has(reg.sido)) { reg.city = reg.sido; reg.cityKey = reg.sido; }
    list.push({ area, n: x.n, e: x.e, c: x.c, r: x.r, t: x.t, sido: reg.sido, city: reg.city, cityKey: reg.cityKey, sn: x.sn, slug: x.sn, subjects: subjFor(x.t) });
  }
  const ord = k => { const i = SIDO_ORDER.indexOf(k); return i < 0 ? 999 : i; };
  list.sort((a, b) => ord(a.sido) - ord(b.sido) || a.sido.localeCompare(b.sido, 'ko') || a.city.localeCompare(b.city, 'ko') || a.sn.localeCompare(b.sn, 'ko'));
  return list;
}

/* 지역(묶음+도시). 도시가 묶음과 같으면(싱가포르·홍콩) 이름을 한 번만 쓴다 */
function buildRegions(schools) {
  const map = new Map();
  for (const s of schools) {
    const same = s.city === s.sido;
    const key = same ? s.sido : `${s.sido}-${s.cityKey}`;
    if (!map.has(key)) map.set(key, { key, sido: s.sido, city: s.city, label: same ? s.sido : `${s.sido} ${s.city}`,
      full: same ? s.sido : `${SIDO_FULL[s.sido] || s.sido} ${s.city}`, abroad: s.t === '해외', flag: FLAG[s.sido] || '', schools: [] });
    map.get(key).schools.push(s);
    s.regionKey = key;
  }
  return [...map.values()];
}

/* 선생님 — 과외 생성기와 같은 형식(데이터/README.md) */
function loadTeachers() {
  if (!fs.existsSync(TEACHERS_JS)) return [];
  const raw = fs.readFileSync(TEACHERS_JS, 'utf8');
  const js = raw.slice(raw.indexOf('window.TEACHERS=') + 'window.TEACHERS='.length).trim().replace(/;$/, '');
  const list = JSON.parse(js).filter(t => !EXCLUDE_TEACHERS.has(t.i));
  for (const t of list) {
    t.regions = t.r ? t.r.split('|').map(x => x.trim()).filter(Boolean) : [];
    t.online = t.c.includes('화상');
    t.visit = t.c.includes('방문');
    const f = path.join(TEACHER_DIR, t.i + '.html');
    t.headline = ''; t.intro = '';
    if (fs.existsSync(f)) {
      const h = fs.readFileSync(f, 'utf8');
      const m1 = h.match(/<h2>([^<]+)<\/h2>/);
      const m2 = h.match(/class="td-intro">([^<]+)</);
      if (m1 && m1[1] !== '수업 정보') t.headline = decode(m1[1]);
      if (m2) t.intro = decode(m2[1]);
    }
  }
  return list;
}
const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();

/* 선생님 ↔ 학교: 방문은 국내 학교만(지역 앞 두 토큰이 같으면). 해외 학교는 화상 선생님만 */
function teacherIndex(teachers) {
  const head2 = new Map();
  for (const t of teachers) for (const r of t.regions) {
    const k = r.split(/\s+/).slice(0, 2).join(' ');
    if (!head2.has(k)) head2.set(k, []);
    head2.get(k).push(t);
  }
  return {
    visitFor(school) {
      if (school.t === '해외') return [];
      return (head2.get(school.r.split(/\s+/).slice(0, 2).join(' ')) || []).slice();
    }
  };
}

/* 국제학교 선생님은 학년 범위 대신 과목만 본다 */
const coversLevel = () => true;

function load(opts = {}) {
  const schools = loadSchools(opts);
  const regions = buildRegions(schools);
  let teachers = loadTeachers();
  if (opts.teacherSubjects) teachers = teachers.filter(t => (t.s || []).some(x => opts.teacherSubjects.includes(x)));
  const tidx = teacherIndex(teachers);
  const levels = opts.levels || ['국내', '해외'];
  const subjFor = opts.subjectsFor || subjectsFor;
  const seen = new Set(), SUBJECTS_ALL = [];
  for (const lv of levels) for (const x of subjFor(lv)) if (!seen.has(x)) { seen.add(x); SUBJECTS_ALL.push(x); }
  return { schools, regions, teachers, tidx, SIDO_ORDER, SIDO_FULL, FLAG, SUBJECTS_HIGH: SUBJECTS_ALL, SUBJECTS_ALL, levels, subjectsFor: subjFor, coversLevel };
}

module.exports = { load, SIDO_ORDER, SIDO_FULL, FLAG, coversLevel, esc };

if (require.main === module) {
  const D = load();
  const kr = D.schools.filter(s => s.t === '국내').length;
  console.log(`학교 ${D.schools.length} (국내 ${kr} · 해외 ${D.schools.length - kr}) · 지역 ${D.regions.length} · 선생님 ${D.teachers.length}`);
  console.log(`학교 페이지 수(허브+과목) ${D.schools.reduce((a, s) => a + 1 + s.subjects.length, 0)}`);
  console.log('지역:', D.regions.map(r => `${r.label}(${r.schools.length})`).join(' / '));
}
