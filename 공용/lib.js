/* 공용 유틸 — 한글 로마자 변환(파일명용), 이스케이프, 학교 슬러그 */

const CHO = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
const JUNG = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
const JONG = ['','k','k','ks','n','nj','nh','t','l','lk','lm','lp','ls','lt','lp','lh','m','p','ps','t','t','ng','t','t','k','t','p','t'];

function roman(str){
  let out = '';
  for (const ch of String(str)) {
    const c = ch.charCodeAt(0);
    if (c >= 0xAC00 && c <= 0xD7A3) {
      const i = c - 0xAC00;
      out += CHO[Math.floor(i / 588)] + JUNG[Math.floor((i % 588) / 28)] + JONG[i % 28];
    } else if (/[a-zA-Z0-9]/.test(ch)) out += ch.toLowerCase();
    else out += '-';
  }
  return out.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

const esc = s => String(s == null ? '' : s).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
const attr = s => esc(s);

/* 학교 이름 → 파일 슬러그. 지역키-학교명(접미사 제외)-급 */
function schoolSlug(region, s, used){
  const bare = s.n.replace(/(초등학교|중학교|고등학교)$/, '').replace(/분교장$/, '-bungyo');
  const lvl = s.t === '초' ? 'cho' : s.t === '중' ? 'jung' : 'go';
  let base = `${region.key}-${roman(bare)}-${lvl}`.replace(/-+/g, '-');
  let slug = base, n = 2;
  while (used.has(slug)) slug = `${base}-${n++}`;
  used.add(slug);
  return slug;
}

/* 학교 이름 약칭 — 2026-10-04 부터 약칭을 제목·본문 앞에 쓴다(사용자 결정).
   사람들은 "선덕여중 과외" 로 검색하지 "선덕여자중학교 과외" 로 검색하지 않는다 — 약칭이 페이지에 없으면 검색에 아예 안 잡힌다.
   정식 명칭은 지우지 않고 함께 쓴다. 예전 규칙(…여자중학교 → …여자중)은 실제로 쓰는 약칭이 아니어서 고쳤다. */
const UNIV = { '단국':'단대','고려':'고대','중앙':'중대','한양':'한대','홍익':'홍대','건국':'건대','동국':'동대','상명':'상명',
  '서울':'서울사대','강원':'강원사대','전남':'전남사대','전북':'전북사대','전주':'전주사대','경북':'경북사대','충북':'충북사대','충남':'충남사대',
  '공주':'공주사대','부산':'부산사대','경상':'경상사대','제주':'제주사대' };
const ABBR_FIX = {   // 규칙으로 안 나오는 것
  '단국대학교부속소프트웨어고등학교': '단국대소프트웨어고',
  '이화여자대학교병설미디어고등학교': '이대병설미디어고',
  '상명대학교사범대학부속여자고등학교': '상명부속여고',
  '상명대학교사범대학부속여자중학교': '상명부속여중'
};
function shortName(n){
  if (ABBR_FIX[n]) return ABBR_FIX[n];
  let m = n.match(/^(.+?)대학교사범대학(?:부속|부설)(.*?)(여자)?(초등학교|중학교|고등학교)$/);
  if (m) {
    const l = m[4] === '고등학교' ? '고' : m[4] === '중학교' ? '중' : '초';
    if (m[2]) return m[2] + (m[3] ? '여' : '') + l;          // …부속무학고등학교 → 무학고
    return (UNIV[m[1]] || m[1]) + '부' + (m[3] ? '여' : '') + l;   // 단국… → 단대부고
  }
  return n
    .replace(/여자상업고등학교$/, '여상').replace(/여자고등학교$/, '여고').replace(/여자중학교$/, '여중')
    .replace(/외국어고등학교$/, '외고').replace(/공업고등학교$/, '공고').replace(/상업고등학교$/, '상고')
    .replace(/예술고등학교$/, '예고').replace(/체육고등학교$/, '체고')
    .replace(/초등학교$/, '초').replace(/중학교$/, '중').replace(/고등학교$/, '고');
}

/* Cloudflare Pages 는 /x.html 로 들어오면 /x 로 308 넘긴다(끌 수 없음).
   넘겨지는 주소가 canonical·sitemap 에 박혀 있으면 검색엔진이 "리디렉션 페이지"로 분류하므로,
   사이트 안 주소를 처음부터 .html 없이 쓴다. 파일 이름은 그대로 x.html (Pages 가 /x 로 찾아 준다).
   - 절대주소  https://도메인/school/a.html → https://도메인/school/a ,  …/index.html → …/
   - 상대링크  href="schools.html" → "schools" ,  "../index.html" → "../" ,  "index.html#apply" → "./#apply" */
function pretty(s, siteUrl){
  const esc = siteUrl.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  s = s.replace(new RegExp(esc + '/([^"\'\\s<>]*?)\\.html', 'g'),
    (m, p) => siteUrl + '/' + (p === 'index' ? '' : p.replace(/(^|\/)index$/, '$1')));
  s = s.replace(/href="(?!https?:|tel:|mailto:|#|data:|\/\/)([^"]*?)\.html(#[^"]*)?"/g, (m, p, h) => {
    let q = p === 'index' ? './' : p.replace(/(^|\/)index$/, '$1');
    if (q === '') q = './';
    return `href="${q}${h || ''}"`;
  });
  return s;
}

const LEVEL = { '초':'초등학교', '중':'중학교', '고':'고등학교' };
const LEVELKO = { '초':'초등', '중':'중등', '고':'고등' };

module.exports = { roman, esc, attr, schoolSlug, shortName, pretty, LEVEL, LEVELKO };
