/* 페이지 생성 — 국제학교 × 과목 과외 사이트 (과외사이트 복제키트의 생성기를 국제학교용으로 바꿈, 2026-10-27)
   모든 함수는 (S=사이트 설정, D=데이터, …) → HTML 문자열. 파일 쓰기는 run.js 가 한다.
   학교 묶음(t)은 국내 / 해외. 해외 학교는 화상 수업만, 국내 학교는 화상·방문. */
const { TEL, TELRAW } = require('./sites');
const { SUBJ, C, HUB_INTRO, GUIDES, hash, pick, track, SEN_NAME, MID_NAME } = require('./copy');
const SPEC = require('./specialty');            // 둘째 메뉴 '커리큘럼'
const { PROFILES: PROF } = require('./profiles');
const profOf = S => PROF[S.profile || 'intl'];
const specOf = S => SPEC.PROFILES[S.profile || 'intl'] || null;
const LVWORD = () => '국제학교';
/* 학교 묶음별 학교찾기 페이지 */
const FINDER = { 국내: ['국내국제학교찾기', 'pages/국내국제학교찾기.html'], 해외: ['해외국제학교찾기', 'pages/해외국제학교찾기.html'] };
const LV_KEYS = ['국내', '해외'];
const { BLOG, ADMISSIONS } = require('./posts');
const { esc, coversLevel } = require('./data');

const LEVEL = { 국내: '국내 국제학교', 해외: '해외 국제학교' };
/* 한국 날짜 — 데일리는 새벽 2시에 돈다. toISOString() 그대로면 세계 표준시라 전날이 찍힌다(2026-10-19 실제 발생) */
const TODAY = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
/* 과목 → 선생님 데이터의 과목 이름(선생님 데이터에는 수학·영어·과학·사회 같은 큰 과목만 적는다) */
const T_SUBJ = { 물리: '과학', 화학: '과학', 생물: '과학', 에세이: '영어', SAT: '영어', 입학준비: '영어' };
const MODE = s => s.t === '해외' ? '화상 1:1' : '화상·방문 1:1';
const josa = (w, a, b) => { const c = String(w).charCodeAt(String(w).length - 1); const has = c >= 0xAC00 && c <= 0xD7A3 ? (c - 0xAC00) % 28 !== 0 : false; return w + (has ? a : b); };

/* 주소 — 파일명은 한글 그대로, canonical·사이트맵은 퍼센트 인코딩 */
const hubFile = s => `pages/${s.slug}-과외.html`;
const subFile = (s, sub) => `pages/${s.slug}-${sub}-과외.html`;
const regionFile = r => `pages/${r.key}-국제학교-과외.html`;
const regionLink = key => `${key}-국제학교-과외.html`;       // pages/ 안에서 쓰는 상대 주소
const subjIndexFile = sub => `pages/${sub}과외-전체.html`;
const encPath = p => p.split('/').map(encodeURIComponent).join('/');
const abs = (S, p) => S.siteUrl + '/' + encPath(p);

/* 링크 미리보기 그림 — 섹션별(2026-10-25 사용자 요청 "페이지별로 이미지"). 그림은 저장소 루트 og-{섹션}.jpg (sites.js ogSections: true 인 사이트만),
   만드는 도구는 도구/학교과외/og그림/(render.ps1). 홈·404 는 og-image.jpg. 지역 페이지는 o.og='regions' 로 넘긴다 */
function ogFor(S, o) {
  if (!S.ogSections) return 'og-image.jpg';   // sites.js ogSections: true 인 곳만 섹션별 그림이 있다
  const p = o.path;
  if (o.og) return `og-${o.og}.jpg`;
  if (p === 'regions.html') return 'og-regions.jpg';
  if (/^pages\/.*과외-전체\.html$/.test(p)) return 'og-subjects.jpg';
  if (/^pages\//.test(p)) return 'og-schools.jpg';
  if (p === 'teachers.html' || /^t\//.test(p)) return 'og-teachers.jpg';
  if (/^(conversation|essay|advanced)\//.test(p)) return 'og-conv.jpg';
  if (p === 'blog.html' || /^blog\//.test(p)) return 'og-blog.jpg';
  if (p === 'admissions.html' || /^admissions\//.test(p)) return 'og-admissions.jpg';
  if (p === 'contact.html') return 'og-contact.jpg';
  return 'og-image.jpg';
}

/* ---------- 공통 조각 ---------- */
function head(S, o) {
  const url = abs(S, o.path === 'index.html' ? '' : o.path);
  /* 검색엔진 소유확인 메타 — 홈에만. sites.js 의 naverVerify · googleVerify (비어 있으면 안 넣음) */
  const verify = o.path !== 'index.html' ? '' : (S.naverVerify ? `
<meta name="naver-site-verification" content="${S.naverVerify}" />` : '') + (S.googleVerify ? `
<meta name="google-site-verification" content="${S.googleVerify}" />` : '');
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}" />
${o.kw ? `<meta name="keywords" content="${esc(o.kw)}" />\n` : ''}${o.noindex ? '<meta name="robots" content="noindex,follow" />' : `<link rel="canonical" href="${url}" />`}${verify}
<meta name="theme-color" content="${S.theme.primary}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${esc(S.brand)}" />
<meta property="og:title" content="${esc(o.title)}" />
<meta property="og:description" content="${esc(o.desc)}" />
<meta property="og:url" content="${url}" />
<meta property="og:locale" content="ko_KR" />
<meta property="og:image" content="${S.siteUrl}/${ogFor(S, o)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${esc(S.brand)} — ${profOf(S).tagSchools} 학교별 1:1 과외" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${S.siteUrl}/${ogFor(S, o)}" />
<link rel="icon" href="${o.up}favicon.svg" type="image/svg+xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="${o.up}style.css?v=4" />
<script src="${o.up}analytics.js" defer></script>
${o.ld ? `<script type="application/ld+json">${JSON.stringify(o.ld)}</script>\n` : ''}</head>
<body>`;
}

/* 메뉴 — 사이트 성격별 (2026-10-24): 학교찾기는 학교급만큼, 둘째 메뉴는 회화(일반) 또는 전문 메뉴(논술·최상위 과학) */
function navFor(S) {
  const sp = specOf(S);
  const finders = LV_KEYS.map(k => [FINDER[k][1], LEVEL[k] + ' 찾기']);
  const firstSub = (S.subjectsAll || ['수학'])[0];
  return [
    ['국제학교 과외', 'tutor', null, [...finders, ['regions.html', '나라·지역별'], [`pages/${firstSub}과외-전체.html`, '과목별 과외']]],
    [sp.menu, 'conv', `${sp.dir}/index.html`, sp.pages.map(p => [`${sp.dir}/${p.key}.html`, p.name])],
    ['선생님', 'teachers', 'teachers.html', null],
    ['수업 이야기', 'blog', 'blog.html', null],
    ['유학·입시정보', 'admissions', 'admissions.html', null]
  ];
}

function nav(S, active, up) {
  const li = navFor(S).map(([t, k, href, sub]) => {
    const a = `<a href="${up}${href || sub[0][0]}"${k === active ? ' class="active"' : ''}>${t}</a>`;
    return sub ? `<li>${a}<div class="sub">${sub.map(([h, n]) => `<a href="${up}${h}">${n}</a>`).join('')}</div></li>` : `<li>${a}</li>`;
  }).join('\n      ');
  /* 모바일 메뉴는 app.js 가 데스크톱 목록을 복사해 만든다(페이지마다 두 벌 넣지 않아 용량 절약) */
  return `<header>
  <div class="wrap nav">
    <a href="${up}index.html" class="brand">${esc(S.brand)}<small>${esc(S.en)}</small></a>
    <ul class="nav-links">
      ${li}
    </ul>
    <div class="nav-cta">
      <a href="${up}contact.html" class="btn btn-primary btn-sm">상담신청</a>
      <button class="menu-btn" type="button" aria-label="메뉴" data-menu>☰</button>
    </div>
  </div>
  <nav class="m-nav wrap" data-mnav data-tel="${up}contact.html"></nav>
</header>`;
}

function foot(S, up) {
  const kakao = S.kakao ? `<a href="${S.kakao}" target="_blank" rel="noopener" class="btn btn-kakao">💬 카카오톡</a>` : '';
  return `<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a href="${up}index.html" class="brand">${esc(S.brand)}</a>
        <p style="margin:12px 0 6px">${esc(S.tagline)}</p>
        <p class="small">상담 ${TEL} · 해외 화상 · 국내 방문 1:1 과외</p>
      </div>
      <div><h5>국제학교 과외</h5><ul>
        ${LV_KEYS.map(k => `<li><a href="${up}${FINDER[k][1]}">${LEVEL[k]} 찾기</a></li>`).join('\n        ')}
        <li><a href="${up}regions.html">나라·지역별</a></li>
        <li><a href="${up}teachers.html">선생님</a></li>
      </ul></div>
      <div><h5>${esc(specOf(S).menu)}</h5><ul>
        ${specOf(S).pages.map(p => [`${specOf(S).dir}/${p.key}.html`, p.title]).map(([h, t]) => `<li><a href="${up}${h}">${esc(t)}</a></li>`).join('\n        ')}
      </ul></div>
      <div><h5>정보</h5><ul>
        <li><a href="${up}blog.html">수업 이야기</a></li>
        <li><a href="${up}admissions.html">유학·입시정보</a></li>
        <li><a href="${up}contact.html">상담 신청</a></li>
      </ul></div>
    </div>
    <div class="copy-bar"><span>© ${new Date().getFullYear()} ${esc(S.brand)}. 선생님 이름은 개인정보 보호를 위해 가려 표기합니다.</span><span><a href="${up}sitemap.xml">사이트맵</a></span></div>
  </div>
</footer>
<div class="float-cta">${kakao}<a href="tel:${TELRAW}" class="btn btn-primary">📞 ${TEL}</a></div>
<script src="${up}app.js" defer></script>
${o_scripts(S, up)}
</body>
</html>`;
}
function o_scripts(S, up) {
  return `<script src="${up}form.js" defer></script>\n<script src="${up}quick.js" defer></script>` + (S.channelKey ? `\n<script src="${up}channeltalk.js" defer></script>` : '');
}
/* 줄 앞 공백·빈 줄 제거 — 페이지 5만 장이라 용량이 곧 호스팅 한도(GitHub Pages 1GB)다. <pre>/<textarea> 안에 내용이 없으므로 안전 */
const slim = html => html.split('\n').map(l => l.replace(/^\s+/, '')).filter(l => l.length).join('\n');
const page = (S, o, body) => slim(head(S, o) + '\n' + (S.topbar ? `<div class="topbar">${esc(S.topbar)}</div>\n` : '') + nav(S, o.active, o.up) + '\n' + body + '\n' + foot(S, o.up));

/* ===== 목록 부품 (2026-10-19 — "학교·동네 리스트가 지저분하다" → 티처스 격자 + 와와 줄 맞춤 + 티칭코칭 지역 상자) ===== */
/* 학교 칸 격자: 같은 크기 칸에 약칭 + 작은 꼬리말 */
const cells = (list, hrefOf, tail, cls = '') => `<div class="sgrid${cls}">${list.map(s => `<a href="${hrefOf(s)}"><b>${esc(s.sn)}</b> <span>${esc(tail)}</span></a>`).join('')}</div>`;
/* 지역 칸 격자: "상하이 · 6개교" */
const regionCells = (regions, hrefOf) => `<div class="rgrid">${regions.map(r => `<a href="${hrefOf(r)}"><b>${esc(r.city)}</b> <span>${r.schools.length}개교</span></a>`).join('')}</div>`;
const bySido = (D, items) => { const m = new Map(); for (const x of items) { if (!m.has(x.sido)) m.set(x.sido, []); m.get(x.sido).push(x); } return D.SIDO_ORDER.filter(k => m.has(k)).map(k => [k, m.get(k)]); };
/* 시도 → 시군구 줄 → 학교 칸 (학교찾기·과목 전체 페이지). pages/ 안에서 쓰는 상대 주소 기준 */
function cityGroups(D, list, hrefOf, tail, idPrefix = '') {
  const groups = bySido(D, list);
  const navH = `<div class="sido-nav">${groups.map(([k, ss]) => `<a href="#${idPrefix}${k}">${k}<em>${ss.length}</em></a>`).join('')}</div>`;
  const blocks = groups.map(([k, ss]) => {
    const cities = new Map();
    for (const s of ss) { if (!cities.has(s.regionKey)) cities.set(s.regionKey, []); cities.get(s.regionKey).push(s); }
    return `<div class="sido-block" id="${idPrefix}${k}" data-block>
<div class="sido-head"><h2>${D.FLAG[k] ? D.FLAG[k] + ' ' : ''}${k}</h2><span>${ss.length.toLocaleString()}개교${cities.size > 1 ? ` · ${cities.size}개 도시` : ''}</span></div>
${[...cities].map(([key, cs]) => `<div class="city" data-city><h3><a href="${regionLink(key)}">${esc(cs[0].city)}</a><em>${cs.length}개교</em></h3>${cells(cs, hrefOf, tail)}</div>`).join('\n')}
</div>`;
  }).join('\n');
  return { navH, blocks };
}
/* 시도별 지역 상자 (지역과외·홈) */
function regionBoxes(D, up, tabs) {
  const groups = bySido(D, D.regions);
  const box = ([k, rs], i) => `<div class="region-box${tabs && i ? ' is-off' : ''}"${tabs ? ` data-panel="${k}"` : ''} id="r-${k}"><h3>${D.FLAG[k] ? D.FLAG[k] + ' ' : ''}${k}<span>${rs.length > 1 ? `${rs.length}개 도시 · ` : ''}학교 ${rs.reduce((a, r) => a + r.schools.length, 0).toLocaleString()}곳</span></h3>${regionCells(rs, r => `${up}${regionFile(r)}`)}</div>`;
  if (!tabs) return `<div class="sido-nav" style="margin:0 0 22px">${groups.map(([k, rs]) => `<a href="#r-${k}">${k}<em>${rs.length}</em></a>`).join('')}</div>\n` + groups.map(box).join('\n');
  return `<div class="rtabs" data-tabs>${groups.map(([k], i) => `<button type="button" data-tab="${k}" aria-pressed="${i ? 'false' : 'true'}">${k}</button>`).join('')}</div>\n${groups.map(box).join('\n')}`;
}

function crumbLd(S, items) {
  return { '@type': 'BreadcrumbList', itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: p == null ? undefined : abs(S, p) })) };
}
function faqLd(faq) { return { '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }; }

const FORM_SUBJECTS = PROF.intl.formSubjects;
const GRADES = ['K~G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12', '졸업생·대학 준비', '입학 예정'];
const formSubjectsOf = S => profOf(S).formSubjects;
function formSection(S, id, opt = {}) {
  return `<section id="apply" class="soft">
  <div class="wrap">
    <h2 class="center">${esc(opt.title || '무료 상담 신청')}</h2>
    <p class="lead center">${esc(opt.lead || '전문 선생님이 곧 연락드립니다.')}</p>
    <div class="form-card" style="margin-top:26px">
      <form id="${id}">
        <div class="row2">
          <div class="field"><label for="${id}_name">학부모/학생 이름 *</label><input id="${id}_name" required placeholder="홍길동" /></div>
          <div class="field"><label for="${id}_phone">연락처 *</label><input id="${id}_phone" required inputmode="tel" placeholder="010-0000-0000" /></div>
        </div>
        <div class="row2">
          <div class="field"><label for="${id}_school">학교 *</label><input id="${id}_school" required placeholder="예: ${esc(opt.school || '채드윅송도')}" value="${esc(opt.school || '')}" /></div>
          <div class="field"><label for="${id}_grade">학년 (Grade) *</label>
            <select id="${id}_grade" required><option value="">선택</option>${GRADES.map(g => `<option>${g}</option>`).join('')}</select></div>
        </div>
        <div class="row2">
          <div class="field"><label for="${id}_subject">과목 *</label>
            <select id="${id}_subject" required><option value="">선택</option>${formSubjectsOf(S).map(s => `<option${s === opt.subject ? ' selected' : ''}>${s}</option>`).join('')}</select></div>
          <div class="field"><label for="${id}_mode">수업 방식</label>
            <select id="${id}_mode"><option>상관없음</option><option>화상수업</option><option>방문수업(국내)</option></select></div>
        </div>
        <div class="row2">
          <div class="field"><label for="${id}_area">사는 곳 (나라·도시)</label><input id="${id}_area" placeholder="예: ${esc(opt.area || '싱가포르 / 인천 송도')}" /></div>
          <div class="field"><label for="${id}_gender">선생님 성별</label>
            <select id="${id}_gender"><option>상관없음</option><option>여선생님</option><option>남선생님</option></select></div>
        </div>
        <div class="field"><label for="${id}_memo">남기실 말씀</label><textarea id="${id}_memo" placeholder="지금 어려워하는 부분, 원하는 수업 시간 등을 적어주세요."></textarea></div>
        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center">무료 상담 신청하기</button>
        <div class="ok" id="${id}_ok">신청이 접수되었습니다. 곧 연락드리겠습니다. 급하시면 ${TEL} 로 전화 주세요.</div>
      </form>
      <p class="small muted center" style="margin:14px 0 0">전화 상담 — <a href="tel:${TELRAW}"><b>${TEL}</b></a></p>
    </div>
  </div>
</section>`;
}

function ctaBand(S, up, title, lead) {
  return `<section class="cta-band">
  <div class="wrap">
    <h2>${esc(title)}</h2>
    <p class="lead">${esc(lead)}</p>
    <div class="hero-cta" style="justify-content:center">
      <a href="tel:${TELRAW}" class="btn btn-primary">📞 ${TEL}</a>
      <a href="${up}contact.html" class="btn btn-ghost">온라인 상담 신청</a>
    </div>
  </div>
</section>`;
}

function teacherCard(t, up) {
  return `<a class="t-card" href="${up}t/${t.i}.html" data-s="${esc(t.s.join(','))}" data-c="${esc(t.c)}" data-sd="${esc(t.sd || '전국')}">
  <div class="t-top">${t.p ? `<img class="t-photo" src="${up}${t.p}" alt="${esc(t.n)} 선생님" loading="lazy" width="56" height="56">` : `<span class="t-photo t-ini">${esc([...t.n][0])}</span>`}<div><div class="t-name">${esc(t.n)} 선생님</div><div class="t-meta">${[t.c, t.g, t.regions[0] || '전국 화상'].filter(Boolean).map(esc).join(' · ')}</div></div></div>
  <p class="t-tag">${esc(t.tag || t.headline)}</p>
  <div class="t-sub">${t.s.map(x => `<b>${esc(x)}</b>`).join('')}${(t.gr && t.gr[0]) ? `<b>${esc(t.gr[0])}</b>` : ''}</div>
</a>`;
}

/* 학교 페이지에 보여 줄 선생님: 방문 가능(지역) 먼저, 화상은 학교마다 다른 사람이 보이게 시작점을 민다 */
function teachersFor(D, s, sub) {
  const want = sub ? (T_SUBJ[sub] || sub) : null;
  const ok = t => (!want || t.s.includes(want)) && coversLevel(t.gr, s.t);
  const local = D.tidx.visitFor(s).filter(ok);
  const online = D.teachers.filter(t => t.online && ok(t) && !local.includes(t));
  const h = hash(s.slug + (sub || ''));
  const rot = online.length ? online.slice(h % online.length).concat(online.slice(0, h % online.length)) : [];
  return { local, show: local.slice(0, 3).concat(rot).slice(0, 4) };
}

/* ---------- 학교 허브 ---------- */
function hubPage(S, D, s, region) {
  const sn = s.sn, up = '../', abroad = s.t === '해외';
  const t = track(s);
  const subjLinks = s.subjects.map(sub => `<a class="school-item" href="${s.slug}-${sub}-과외.html">${SUBJ[sub].icon} ${esc(sn)} ${sub}과외<i>${esc(s.n)} ${sub}</i></a>`).join('\n        ');
  const { local, show } = teachersFor(D, s, null);
  const near = region.schools.filter(x => x !== s).slice(0, 12);
  const [g1, g2] = pick(GUIDES, s.slug, 2);
  const kw = [`${sn} 과외`, ...s.subjects.slice(0, 5).map(v => `${sn} ${v}과외`), `${s.n} 과외`, `${s.e.replace(/\s*\(.*\)$/, '')} 과외`, `${region.label} 국제학교 과외`, `${sn} 입학`, `${sn} 화상과외`];
  const faq = [
    [`${sn} 학생만 신청할 수 있나요?`, `아닙니다. ${s.n} 학생이 쉽게 찾도록 따로 만든 안내일 뿐, ${region.label}의 다른 국제학교나 같은 커리큘럼(${s.c})을 쓰는 학교 학생도 똑같이 수업받을 수 있습니다.`],
    [abroad ? '해외에 있는데 시차는 어떻게 맞추나요?' : '방문 수업과 화상 수업 중 무엇이 맞을까요?', abroad ? `${region.label} 현지 시간 기준으로 학교가 끝난 뒤나 주말에 맞춥니다. 상담 때 가능한 시간대를 알려 주시면 그 시간에 수업할 수 있는 선생님을 찾습니다.` : '저학년이거나 혼자 집중하기 어렵다면 방문이, 더 많은 선생님 가운데 고르거나 늦은 시간에 수업하려면 화상이 맞습니다. 지역에 따라 방문 가능 여부가 달라 상담 때 확인해 드립니다.'],
    ['선생님은 어떻게 정해지나요?', `학교·학년(Grade)·과목·커리큘럼을 알려 주시면 ${s.c} 과정을 가르쳐 본 선생님 가운데 2~3명을 골라 소개합니다. 첫 수업을 해 보고 맞지 않으면 다른 선생님으로 바꿔 드립니다.`],
    ['수업료는 얼마인가요?', '학년, 과목, 일주일 수업 횟수, 수업 방식에 따라 달라집니다. 상담에서 조건을 확인한 뒤 정확한 금액을 알려 드리고, 그 전까지는 어떤 비용도 들지 않습니다.'],
    ['상담에 비용이 드나요?', `들지 않습니다. ${TEL}로 전화하시거나 아래 신청서를 남겨 주시면 24시간 안에 연락드립니다.`]
  ];
  const ld = { '@context': 'https://schema.org', '@graph': [
    crumbLd(S, [['홈', 'index.html'], [FINDER[s.t][0], FINDER[s.t][1]], [`${sn} 과외`, hubFile(s)]]),
    { '@type': 'Service', serviceType: `${s.n} 1:1 맞춤 과외`, areaServed: region.full, name: `${sn} 과외`, provider: { '@type': 'EducationalOrganization', name: S.brand, url: S.siteUrl + '/', telephone: '+82-' + TELRAW.replace(/^0/, '') } },
    faqLd(faq)
  ] };
  const ib = t.sen === 'ib' || t.sen === 'apib';
  const gradeBlock = `
      <h2>${esc(sn)} 학년마다 챙기는 것이 다릅니다</h2>
      <ul>
        <li><b>${t.mid === 'igcse' ? 'Primary (Year 1~6)' : '엘리멘터리 (K~G5)'}</b> — 영어로 읽고 쓰는 힘이 모든 과목의 바탕이 되는 시기입니다. 리딩 레벨과 수학 기초 연산을 학년 수준에 맞춰 둡니다.</li>
        <li><b>${t.mid === 'igcse' ? '중등 (Year 7~11)' : '미들스쿨 (G6~G8)'}</b> — ${MID_NAME[t.mid]} 과정입니다. 과제와 프로젝트 비중이 커지고, 수학·과학에서 영어 서술형 답안이 늘어납니다.${t.mid === 'igcse' ? ' Year 10~11에는 IGCSE 최종 시험이 있습니다.' : ''}</li>
        <li><b>${t.mid === 'igcse' ? '고등 (Year 12~13)' : '하이스쿨 (G9~G12)'}</b> — ${SEN_NAME[t.sen]} 과정입니다. ${ib ? 'IA·EE·TOK 같은 과제와 최종 시험이 2년에 걸쳐 쌓입니다.' : t.sen === 'alevel' ? '3~4과목을 깊게 배우고, Mock 시험과 예측 성적이 대학 지원에 쓰입니다.' : '학기 성적(GPA)이 대학 지원의 중심이고, AP·SAT 같은 시험을 함께 준비합니다.'}</li>
      </ul>
      <h2>🎒 ${esc(sn)} 입학·편입을 준비한다면</h2>
      <p>${abroad ? `${region.label}의 국제학교는 학기 중에도 결원이 생기면 편입 시험을 보는 곳이 많습니다. 부모님 발령으로 갑자기 옮기게 된 경우라면 영어 읽기·에세이와 영어로 된 수학을 먼저 점검합니다.` : `${esc(sn)}처럼 국내에 있는 국제학교·외국인학교는 학교마다 지원 자격과 시험 방식이 다릅니다. 학교 입학처 안내로 자격과 일정을 먼저 확인하고, 영어 읽기·에세이·수학·인터뷰 순서로 준비합니다.`} 자세한 준비 방법은 <a href="${s.slug}-입학준비-과외.html">${esc(sn)} 입학준비 안내</a>에 정리했습니다.</p>`;
  const teacherHtml = show.length ? `
      <h2>${esc(sn)} 과외 선생님</h2>
      <p>${local.length ? `${esc(region.label)} 방문 가능 선생님 ${local.length}명과 화상 선생님 가운데 일부입니다.` : '화상 선생님 가운데 일부입니다.'} 전체는 <a href="${up}teachers.html">선생님 페이지</a>에서 과목별로 볼 수 있습니다.</p>
      <div class="t-grid" style="margin:14px 0 6px">${show.map(x => teacherCard(x, up)).join('\n')}</div>` : '';
  return page(S, { path: hubFile(s), up, active: 'tutor', ld,
    title: `${sn} 과외 | ${s.n} ${s.c} 1:1 — ${region.label} · ${S.brand}`,
    desc: `${sn}(${s.n}, ${s.e}) 과외. ${s.c} 과정에 맞춘 수학·영어·에세이·과학·SAT·입학준비 1:1 수업. ${abroad ? '해외 현지 시차에 맞춘 화상 수업' : '화상·방문 수업'}, 무료 상담 ${TEL}.`,
    kw: kw.join(', ') }, `
<section class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="${up}index.html">홈</a> › <a href="${FINDER[s.t][0]}.html">${LEVEL[s.t]}</a> › <a href="${regionLink(region.key)}">${esc(region.label)}</a> › ${esc(sn)}</div>
    <h1>${esc(sn)} 과외 — ${esc(s.n)} 1:1 맞춤 수업</h1>
    <p class="lead">${esc(s.e)} · ${esc(s.area)} · ${esc(s.c)} · ${MODE(s)}</p>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="article">
      <p>${pick(HUB_INTRO, s.slug)[0]({ sn: esc(sn), n: esc(s.n), e: esc(s.e), c: esc(s.c) }, esc(s.area))}</p>
      <div class="kwlist">${kw.slice(0, 7).map(k => `<span>${esc(k)}</span>`).join('')}</div>

      <h2>${esc(sn)} 과목별 과외</h2>
      <div class="school-grid" style="margin:14px 0">
        ${subjLinks}
      </div>
      ${gradeBlock}

      <h2>${esc(sn)} 성적은 이렇게 매겨집니다</h2>
      <p>${ib ? 'IB 과정은 최종 시험만으로 점수가 나오지 않습니다. 과목마다 IA(내부평가)가 있고, EE(소논문)와 TOK가 따로 점수에 더해집니다. 그래서 시험 공부와 과제 마감을 한 달력에서 함께 관리합니다.' : t.sen === 'alevel' ? '영국식 과정은 최종 시험 비중이 큽니다. Past Paper와 Mark Scheme(채점 기준)이 공개되어 있어, 시험 형식에 익숙해지는 연습이 곧 점수입니다.' : '미국식 과정은 숙제·퀴즈·테스트·프로젝트가 모두 학기 성적(GPA)에 들어갑니다. 한 번의 시험보다 매주 쌓이는 점수를 놓치지 않는 것이 중요합니다.'}</p>
      <ul>
        <li><b>과제 일정</b> — 과목별 마감을 한 달력에 모으고 초고 날짜를 따로 정하기</li>
        <li><b>영어 서술</b> — 수학·과학도 풀이와 설명을 영어 문장으로 쓰는 연습</li>
        <li><b>채점 기준</b> — 루브릭·Mark Scheme을 먼저 읽고 빠진 항목 확인</li>
        <li><b>피드백</b> — 돌려받은 과제의 코멘트를 다시 쓰기로 마무리</li>
      </ul>

      <h2>${esc(sn)} 학생에게 1:1 과외가 맞는 이유</h2>
      <table>
        <tr><th>비교</th><th>한국식 학원</th><th>1:1 과외</th></tr>
        <tr><td>진도</td><td>한국 교과·선행 중심</td><td>${esc(sn)} ${esc(s.c)} 진도 그대로</td></tr>
        <tr><td>언어</td><td>한국어 문제집</td><td>학교에서 쓰는 영어 용어·문제</td></tr>
        <tr><td>과제</td><td>봐 주기 어려움</td><td>루브릭 기준으로 구조·논리 점검</td></tr>
        <tr><td>시간</td><td>정해진 시간표</td><td>${abroad ? '현지 시차에 맞춰 조정' : '학생 일정에 맞춰 조정'}</td></tr>
      </table>

      <h2>${esc(sn)} ${abroad ? '화상 수업' : '방문 수업 · 화상 수업'}</h2>
      <p>${abroad ? `${esc(region.label)}에 있는 학생은 <b>화상 수업</b>으로 진행합니다. 학교 과제와 풀이를 화면에 같이 띄워 놓고 수업하고, 수업 기록이 남아 복습하기 좋습니다. 현지 시간 기준으로 학교가 끝난 뒤나 주말에 맞춥니다.` : `${esc(s.area)} 지역은 선생님이 찾아가는 <b>방문 수업</b>을 상담할 수 있습니다. 더 많은 선생님 가운데 고르거나 늦은 시간에 수업하려면 <b>화상 수업</b>이 편합니다.`}</p>
${teacherHtml}
      <h2>💡 국제학교 공부 팁</h2>
      <h3>${esc(g1[0])}</h3><p>${esc(g1[1])}</p>
      <h3>${esc(g2[0])}</h3><p>${esc(g2[1])}</p>
${near.length ? `
      <h2>${esc(region.label)} 다른 국제학교 과외</h2>
      ${cells(near, x => `${x.slug}-과외.html`, '과외')}
      <p class="small"><a href="${regionLink(region.key)}">${esc(region.label)} 국제학교 전체 보기 →</a></p>` : ''}

      <h2>❓ 자주 묻는 질문</h2>
      <div class="faq-list">${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n')}</div>

      <div class="hl-box">💡 <b>${esc(S.brand)}</b>는 ${esc(josa(sn, '과', '와'))} 같은 국내·해외 국제학교 ${D.schools.length.toLocaleString()}곳의 학생을 학교별로 1:1 과외에 연결해 드립니다. 상담 비용은 없습니다 — 📞 <a href="tel:${TELRAW}"><b>${TEL}</b></a></div>
      <p class="small muted">※ 이 페이지는 ${esc(S.brand)}의 과외 안내이며 ${esc(s.n)}의 공식 페이지가 아닙니다. 입학 자격·일정·학비는 학교 공식 안내로 확인해 주세요.</p>
    </div>
  </div>
</section>
${formSection(S, 'f_hub', { title: `${sn} 과외 무료 상담`, school: sn, area: s.area })}`);
}

/* ---------- 학교 × 과목 ---------- */
function subjectPage(S, D, s, sub, region) {
  const sn = s.sn, K = C[sub], up = '../', abroad = s.t === '해외';
  const { show } = teachersFor(D, s, sub);
  const others = s.subjects.filter(x => x !== sub).map(x => `<a class="school-item" href="${s.slug}-${x}-과외.html">${SUBJ[x].icon} ${esc(sn)} ${x}과외</a>`).join('\n        ');
  const sameSubjNear = region.schools.filter(x => x !== s && x.subjects.includes(sub)).slice(0, 10);
  const faq = [...K.faq,
    [`${sn} 학생만 신청할 수 있나요?`, `아닙니다. ${s.n} 학생이 쉽게 찾도록 만든 안내일 뿐, 같은 커리큘럼(${s.c})을 쓰는 다른 학교 학생도 똑같이 수업받을 수 있습니다.`],
    [`${sn} ${sub} 선생님은 어떻게 정해지나요?`, `학년(Grade), 지금 듣는 과목 이름, 최근 성적표나 과제 피드백을 보고 ${josa(sub, '을', '를')} 가르쳐 본 선생님 2~3명을 골라 소개합니다. 첫 수업 뒤 맞지 않으면 다른 선생님으로 바꿔 드립니다.`],
    ['상담에 비용이 드나요?', `들지 않습니다. ${TEL}로 전화하시거나 신청서를 남겨 주시면 24시간 안에 연락드립니다.`]];
  /* 과목 페이지가 가장 많다 — JSON-LD 는 빵부스러기만(FAQ 구조화데이터는 허브에만) */
  const ld = { '@context': 'https://schema.org', '@graph': [
    crumbLd(S, [['홈', 'index.html'], [`${sn} 과외`, hubFile(s)], [`${sn} ${sub}과외`, subFile(s, sub)]])] };
  const kw = [`${sn} ${sub}과외`, `${sn} ${sub}`, `${s.n} ${sub}과외`, `${region.label} 국제학교 ${sub}과외`, `${sn} ${sub} 튜터`, `국제학교 ${sub}과외`, `${sn} 과외`];
  const [g1] = pick(GUIDES, s.slug + sub, 1);
  const prep = sub === 'SAT' ? 'SAT 준비' : sub === '입학준비' ? '입학·편입 준비' : '과제·시험 준비';
  return page(S, { path: subFile(s, sub), up, active: 'tutor', ld,
    title: `${sn} ${sub}과외 | ${s.n} ${sub} ${prep} 1:1 — ${S.brand}`,
    desc: `${sn}(${s.n}) ${sub}과외. ${s.c} 과정에 맞춘 ${sub} ${prep}를 1:1로 합니다. ${abroad ? '현지 시차에 맞춘 화상 수업' : '화상·방문 수업'}, 무료 상담 ${TEL}.` }, `
<section class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="${up}index.html">홈</a> › <a href="${regionLink(region.key)}">${esc(region.label)}</a> › <a href="${s.slug}-과외.html">${esc(sn)}</a> › ${sub}</div>
    <h1>${esc(sn)} ${sub}과외</h1>
    <p class="lead">${esc(s.n)} · ${esc(s.c)} · ${sub} ${prep}를 ${MODE(s)}로</p>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="article">
      <p>${esc(K.lead(s))}</p>
      <div class="kwlist">${kw.slice(0, 5).map(k => `<span>${esc(k)}</span>`).join('')}</div>

      <h2>${esc(sn)} ${sub}, 학년별로 이렇게 봅니다</h2>
      <ul>${K.grades(s).map(([g, x]) => `<li><b>${esc(g)}</b> — ${esc(x)}</li>`).join('\n        ')}</ul>

      <h2>📚 ${esc(sn)} ${sub} ${prep}</h2>
      <p>${esc(sn)} 수업 진도와 과제 일정을 먼저 받아 보고, 아래 네 가지를 차례로 챙깁니다.</p>
      <ul>${K.exam.map(x => { const [a, b] = x.split(' — '); return `<li><b>${esc(a)}</b>${b ? ' — ' + esc(b) : ''}</li>`; }).join('\n        ')}</ul>

      <h2>${esc(sn)} ${sub} 과제·평가</h2>
      <p>${esc(K.perf(s))}</p>

      <h2>${sub} 1:1 과외를 고르는 이유</h2>
      <p>${esc(K.why)}</p>

      <h2>${esc(sn)} ${sub}과외 ${abroad ? '화상 수업' : '방문·화상 수업'}</h2>
      <p>${abroad ? `${esc(region.label)}에 있는 학생은 <b>화상 수업</b>으로 진행합니다. 학교 과제와 학생의 풀이를 화면에 함께 띄워 두기 때문에 어느 줄에서 막혔는지 바로 보입니다. 현지 시차에 맞춰 시간을 잡습니다.` : `${esc(s.area)} 지역은 <b>방문 수업</b>을 상담할 수 있고, 더 많은 선생님 가운데 고르려면 <b>화상 수업</b>이 편합니다. 화상에서는 풀이와 과제를 화면에 같이 띄워 놓고 수업합니다.`}</p>
${show.length ? `
      <h2>${esc(sn)} ${sub}과외 선생님</h2>
      <p>${josa(T_SUBJ[sub] || sub, '을', '를')} 가르치는 선생님 가운데 일부입니다. 전체는 <a href="${up}teachers.html">선생님 페이지</a>에서 볼 수 있습니다.</p>
      <ul>${show.map(x => `<li><a href="${up}t/${x.i}.html"><b>${esc(x.n)} 선생님</b></a> (${esc(x.c)}) — ${esc(x.tag || x.headline)}</li>`).join('')}</ul>` : ''}

      <h2>💡 공부 팁 한 가지</h2>
      <h3>${esc(g1[0])}</h3><p>${esc(g1[1])}</p>

      <h2>${esc(sn)} 다른 과목도 함께 준비하세요</h2>
      <div class="school-grid" style="margin:14px 0">
        ${others}
        <a class="school-item" href="${s.slug}-과외.html">🏫 ${esc(sn)} 과외 전체 안내<i>${esc(s.n)}</i></a>
      </div>
${sameSubjNear.length ? `
      <h2>${esc(region.label)} 다른 국제학교 ${sub}과외</h2>
      ${cells(sameSubjNear, x => `${x.slug}-${sub}-과외.html`, sub + '과외')}
      <p class="small"><a href="${sub}과외-전체.html">학교별 ${sub}과외 전체 보기 →</a></p>` : ''}

      <h2>❓ 자주 묻는 질문</h2>
      <div class="faq-list">${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n')}</div>
    </div>
  </div>
</section>
${ctaBand(S, up, `${sn} ${sub}과외, 무료 상담부터 시작하세요`, `학년(Grade)과 요즘 막히는 부분만 남겨 주세요. ${sn} 학생에게 맞는 ${sub} 선생님을 골라 24시간 안에 연락드립니다.`)}`);
}

/* ---------- 지역 페이지 (나라·시도 - 도시) ---------- */
function regionPage(S, D, r) {
  const up = '../';
  const local = r.abroad ? [] : D.tidx.visitFor(r.schools[0]);
  const siblings = D.regions.filter(x => x.sido === r.sido && x !== r);
  const curs = [...new Set(r.schools.map(s => { const t = track(s); return t.sen === 'apib' ? 'AP·IB' : t.sen === 'ib' ? 'IB' : t.sen === 'alevel' ? 'A-Level' : '미국식'; }))];
  const ld = { '@context': 'https://schema.org', '@graph': [crumbLd(S, [['홈', 'index.html'], ['나라·지역별', 'regions.html'], [`${r.label} 국제학교 과외`, regionFile(r)]]),
    { '@type': 'Service', serviceType: `${r.label} 국제학교 1:1 과외`, areaServed: r.full, provider: { '@type': 'EducationalOrganization', name: S.brand, url: S.siteUrl + '/' } }] };
  return page(S, { path: regionFile(r), og: 'regions', up, active: 'tutor', ld,
    title: `${r.label} 국제학교 과외 | ${r.schools.length}개교 학교별 1:1 — ${S.brand}`,
    desc: `${r.full} 국제학교 과외. ${r.schools.slice(0, 5).map(s => s.sn).join('·')}${r.schools.length > 5 ? ' 등' : ''} ${r.schools.length}개교 학교별 1:1 수업. ${curs.join('·')} 커리큘럼, 수학·영어·에세이·과학·SAT·입학준비. ${r.abroad ? '현지 시차에 맞춘 화상 수업' : '화상·방문 수업'}, 무료 상담 ${TEL}.`,
    kw: [`${r.label} 국제학교 과외`, `${r.city} 국제학교`, `${r.city} 국제학교 수학과외`, `${r.city} 국제학교 영어과외`, `${r.city} IB 과외`, `${r.city} 화상과외`, `${r.label} 국제학교 입학`].join(', ') }, `
<section class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="${up}index.html">홈</a> › <a href="${up}regions.html">나라·지역별</a> › ${esc(r.sido)}${r.city !== r.sido ? ` › ${esc(r.city)}` : ''}</div>
    <h1>${r.flag ? r.flag + ' ' : ''}${esc(r.label)} 국제학교 과외 — 학교별 1:1 맞춤 수업</h1>
    <p class="lead">${esc(r.full)} 국제학교 ${r.schools.length}곳 · ${curs.join('·')} · ${r.abroad ? '화상 1:1' : '화상·방문 1:1'}</p>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="article" style="max-width:960px">
      <p>${esc(r.full)}의 국제학교 학생·학부모님께 드리는 안내입니다. 같은 지역 안에서도 학교마다 커리큘럼(IB·AP·IGCSE·A-Level)과 과제 방식이 다릅니다. 아래에서 학교를 누르면 그 학교에 맞춘 과목별 안내로 이어집니다.${r.abroad ? ' 해외에 있는 학생은 현지 시차에 맞춘 화상 수업으로 진행합니다.' : ''}</p>

      <h2>${esc(r.label)} 국제학교 <span class="muted" style="font-size:.9rem;font-weight:500">${r.schools.length}곳</span></h2>
      <div class="school-grid" style="margin:14px 0">
        ${r.schools.map(s => `<a class="school-item" href="${s.slug}-과외.html">🏫 ${esc(s.sn)} 과외<i>${esc(s.n)} · ${esc(s.c)}</i></a>`).join('\n        ')}
      </div>

      <h2>${esc(r.label)} 과목별 과외</h2>
      <div class="chips">${D.SUBJECTS_HIGH.map(sub => `<a class="chip" href="${sub}과외-전체.html">${SUBJ[sub].icon} ${sub}과외</a>`).join('')}</div>
${local.length ? `
      <h2>${esc(r.label)} 방문 가능 선생님</h2>
      <p>${esc(r.label)}로 방문 수업이 가능한 선생님 ${local.length}명 가운데 일부입니다. 화상 선생님까지 포함한 전체는 <a href="${up}teachers.html">선생님 페이지</a>에서 볼 수 있습니다.</p>
      <div class="t-grid" style="margin:14px 0 6px">${local.slice(0, 8).map(t => teacherCard(t, up)).join('\n')}</div>` : `
      <h2>${esc(r.label)} 수업 방식</h2>
      <p>${r.abroad ? `${esc(r.label)} 학생은 화상 수업으로 진행합니다. 현지 시간에 맞춰 수업할 수 있는 선생님을 상담 때 찾아 드립니다.` : `${esc(r.label)}은 방문 수업 가능 여부를 상담 때 일정과 함께 확인해 드립니다. 화상 수업은 바로 시작할 수 있습니다.`} <a href="${up}teachers.html">선생님 보기</a></p>`}
${siblings.length ? `
      <h2>${esc(r.sido)} 다른 도시 국제학교 과외</h2>
      ${regionCells(siblings, x => regionLink(x.key))}` : ''}
      <p class="small muted" style="margin-top:22px">※ 학교 이름은 과외 안내를 위해 적은 것이며, 각 학교와 제휴 관계가 아닙니다. 입학 자격·일정·학비는 학교 공식 안내로 확인해 주세요.</p>
    </div>
  </div>
</section>
${formSection(S, 'f_region', { title: `${r.label} 국제학교 과외 무료 상담`, area: r.label })}`);
}

/* ---------- 목록 페이지들 ---------- */
function schoolFinderPage(S, D, level) {
  const up = '../';
  const list = D.schools.filter(s => s.t === level);
  const [fname, file] = FINDER[level];
  const lvName = LEVEL[level];
  const chips = LV_KEYS.map(k => `<a class="chip"${k === level ? ' aria-pressed="true"' : ''} href="${FINDER[k][0]}.html">${LEVEL[k]} ${D.schools.filter(s => s.t === k).length.toLocaleString()}</a>`).join('');
  const other = LV_KEYS.find(k => k !== level);
  const G = cityGroups(D, list, s => `${s.slug}-과외.html`, '과외');
  return page(S, { path: file, up, active: 'tutor', ld: { '@context': 'https://schema.org', '@graph': [crumbLd(S, [['홈', 'index.html'], [fname, file]])] },
    title: `${lvName} 찾기 — ${list.length.toLocaleString()}개교 학교별 과외 | ${S.brand}`,
    desc: `${lvName} ${list.length.toLocaleString()}곳을 ${level === '국내' ? '지역' : '나라·도시'}별로 모았습니다. 학교 이름을 누르면 그 학교 커리큘럼에 맞춘 과목별 1:1 과외 안내로 이동합니다.`,
    kw: `${lvName} 과외, 국제학교 과외, 국제학교 찾기, ${level === '국내' ? '외국인학교 과외, 제주 국제학교, 송도 국제학교' : '해외 국제학교, 주재원 자녀 과외, 보딩스쿨 과외'}, ${S.brand}` }, `
<section class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="${up}index.html">홈</a> › ${lvName} 찾기</div>
    <h1>${lvName} 찾기 — ${list.length.toLocaleString()}개교</h1>
    <p class="lead">${level === '국내' ? '제주영어교육도시·송도·서울·판교 등 국내 국제학교와 외국인학교입니다.' : '한국 학생이 많이 다니는 해외 국제학교와 보딩스쿨입니다.'} 학교 이름을 누르면 과목별 과외 안내로 갑니다.</p>
    <p class="lead"><b>여기 없는 학교도 수업할 수 있습니다.</b> <a href="${up}contact.html">상담 신청</a>을 남기시거나 <a href="tel:${TELRAW}">${TEL}</a>로 연락 주세요.</p>
    <div class="chips" style="margin-top:16px">${chips}<a class="chip" href="../regions.html">나라·지역으로 찾기</a></div>
    <div class="toolbar"><input class="search" id="q" placeholder="학교·도시 이름 검색 (예: 채드윅, 싱가포르)" data-other="${FINDER[other][0]}.html" data-other-name="${LEVEL[other]}" /><span class="small muted" id="cnt"></span></div>
    ${G.navH}
  </div>
</section>
<section>
  <div class="wrap" id="finder">
    ${G.blocks}
  </div>
</section>
${ctaBand(S, up, '학교 이름이 목록에 없나요?', '목록에 없는 국제학교도 수업할 수 있습니다. 학교 이름과 커리큘럼을 알려 주시면 같은 방식으로 안내드립니다.')}`);
}

function subjectIndexPage(S, D, sub) {
  const up = '../';
  const list = D.schools.filter(s => s.subjects.includes(sub));
  const kr = list.filter(s => s.t === '국내'), ab = list.filter(s => s.t === '해외');
  return page(S, { path: subjIndexFile(sub), up, active: 'tutor', ld: { '@context': 'https://schema.org', '@graph': [crumbLd(S, [['홈', 'index.html'], [`국제학교 ${sub}과외`, subjIndexFile(sub)]])] },
    title: `국제학교 ${sub}과외 — 학교별 ${sub} 1:1 ${list.length.toLocaleString()}곳 | ${S.brand}`,
    desc: `국제학교 ${sub}과외를 학교 이름으로 찾습니다. 국내 ${kr.length}곳·해외 ${ab.length}곳 국제학교의 커리큘럼(IB·AP·IGCSE·A-Level)에 맞춘 ${sub} 1:1 안내. 화상·방문, 무료 상담 ${TEL}.`,
    kw: `국제학교 ${sub}과외, 국제학교 ${sub}, IB ${sub}, AP ${sub}, 학교별 ${sub}과외, ${sub} 화상과외` }, `
<section class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="${up}index.html">홈</a> › 과목별 과외 › ${sub}</div>
    <h1>${SUBJ[sub].icon} 국제학교 ${sub}과외 — 학교별로 찾기</h1>
    <p class="lead">같은 ${sub}이라도 IB·AP·IGCSE·A-Level에 따라 배우는 내용과 평가가 다릅니다. 학교를 고르면 그 학교 커리큘럼에 맞춘 ${sub} 안내로 갑니다.</p>
    <div class="chips" style="margin-top:16px">${D.SUBJECTS_HIGH.map(x => `<a class="chip"${x === sub ? ' aria-pressed="true"' : ''} href="${x}과외-전체.html">${x}</a>`).join('')}</div>
    <div class="toolbar"><input class="search" id="q" placeholder="학교·도시 이름 검색" /><span class="small muted" id="cnt"></span></div>
  </div>
</section>
<section>
  <div class="wrap" id="finder">
    ${kr.length ? (G => `<div class="sec-head"><span class="eyebrow">Korea</span><h2>국내 국제학교 ${sub}과외</h2>${G.navH}</div>\n${G.blocks}`)(cityGroups(D, kr, s => `${s.slug}-${sub}-과외.html`, sub, 'k-')) : ''}
    ${ab.length ? (G => `<div class="sec-head" style="margin-top:30px"><span class="eyebrow">Overseas</span><h2>해외 국제학교 ${sub}과외</h2>${G.navH}</div>\n${G.blocks}`)(cityGroups(D, ab, s => `${s.slug}-${sub}-과외.html`, sub, 'o-')) : ''}
  </div>
</section>
${ctaBand(S, up, `국제학교 ${sub}과외, 학교 이름만 알려 주세요`, '학년(Grade)과 지금 어려운 부분을 말씀해 주시면 맞는 선생님을 찾아 24시간 안에 연락드립니다.')}`);
}

function regionsIndexPage(S, D) {
  const up = '';
  return page(S, { path: 'regions.html', up, active: 'tutor', ld: { '@context': 'https://schema.org', '@graph': [crumbLd(S, [['홈', 'index.html'], ['나라·지역별', 'regions.html']])] },
    title: `나라·지역별 국제학교 과외 — ${D.regions.length}개 지역 학교별 1:1 | ${S.brand}`,
    desc: `국내(제주·송도·서울·판교)와 해외(싱가포르·홍콩·중국·일본·베트남·태국·미국·영국 등) ${D.regions.length}개 지역의 국제학교별 1:1 과외 안내. 해외는 화상, 국내는 화상·방문.`,
    kw: '국제학교 과외, 해외 국제학교 과외, 주재원 자녀 과외, 싱가포르 국제학교 과외, 홍콩 국제학교 과외, 상하이 국제학교 과외, 제주 국제학교 과외' }, `
<section class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="index.html">홈</a> › 나라·지역별</div>
    <h1>나라·지역별 국제학교 과외</h1>
    <p class="lead">아이가 있는 나라와 도시를 고르세요. 그 지역 국제학교 목록과 수업 방식이 나옵니다.</p>
    <p class="lead"><b>목록에 없는 나라·학교도 수업할 수 있습니다.</b> <a href="contact.html">상담 신청</a>을 남기시거나 <a href="tel:${TELRAW}">${TEL}</a>로 연락 주세요.</p>
  </div>
</section>
<section>
  <div class="wrap">
    ${regionBoxes(D, '', false)}
  </div>
</section>
${ctaBand(S, up, '목록에 없는 나라라도 괜찮습니다', '화상 수업은 어느 나라에서든 같은 선생님께 배울 수 있습니다. 상담 때 나라와 학교를 알려 주세요.')}`);
}

/* ---------- 선생님 ---------- */
function teachersPage(S, D) {
  const up = '';
  const sidos = [...new Set(D.teachers.map(t => t.sd).filter(Boolean))];
  return page(S, { path: 'teachers.html', up, active: 'teachers', ld: { '@context': 'https://schema.org', '@graph': [crumbLd(S, [['홈', 'index.html'], ['선생님', 'teachers.html']])] },
    title: `과외 선생님 ${D.teachers.length}명 — 방문·화상 1:1 | ${S.brand}`,
    desc: `${(profOf(S).teacherSubjects || ['수학', '영어', '과학', '사회']).join('·')} 방문 선생님 ${D.teachers.filter(t => t.visit).length}명, 화상 선생님 ${D.teachers.filter(t => t.online).length}명. 과목·수업 방식·지역으로 걸러 보고 상담을 신청하세요.`,
    kw: '과외 선생님, 방문과외 선생님, 화상과외 선생님, 수학 과외 선생님, 영어 과외 선생님' }, `
<section class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="index.html">홈</a> › 선생님</div>
    <h1>과외 선생님 ${D.teachers.length}명</h1>
    <p class="lead">이름은 개인정보 보호를 위해 가려 표기합니다. 카드를 누르면 소개와 수업 정보가 나옵니다.</p>
    <div class="chips" style="margin-top:14px" data-filter="s"><button class="chip" aria-pressed="true" data-v="">전체 과목</button>${(profOf(S).teacherSubjects || ['수학', '영어', '과학', '사회']).map(x => `<button class="chip" data-v="${x}">${x}</button>`).join('')}</div>
    <div class="chips" style="margin-top:8px" data-filter="c"><button class="chip" aria-pressed="true" data-v="">방문·화상</button><button class="chip" data-v="방문">방문 가능</button><button class="chip" data-v="화상">화상 가능</button></div>
    <div class="chips" style="margin-top:8px" data-filter="sd"><button class="chip" aria-pressed="true" data-v="">전국</button>${D.SIDO_ORDER.filter(k => sidos.includes(k)).map(x => `<button class="chip" data-v="${x}">${x}</button>`).join('')}</div>
    <p class="small muted" style="margin:10px 0 0"><span id="tcnt">${D.teachers.length}</span>명 표시 중</p>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="t-grid" id="tgrid">${D.teachers.map(t => teacherCard(t, up)).join('\n')}</div>
  </div>
</section>
${formSection(S, 'f_teachers', { title: '선생님 상담 신청', lead: '원하는 선생님이 있으면 남기실 말씀에 이름을 적어 주세요. 일정이 맞지 않으면 비슷한 선생님을 함께 안내합니다.' })}`);
}

function teacherPage(S, D, t) {
  const up = '../';
  const subj = t.s.join('·');
  const where = t.visit && t.regions.length ? t.regions.join(', ') : '전국 (화상 수업)';
  const schools = [];
  if (t.visit) for (const r of t.regions) {
    const reg = D.regions.find(x => x.label === r || x.label.startsWith(r));
    if (reg) schools.push(...reg.schools.slice(0, 6));
  }
  const similar = D.teachers.filter(x => x !== t && x.s.some(v => t.s.includes(v)) && x.c === t.c).slice(hash(t.i) % 20, hash(t.i) % 20 + 3);
  const title = `${t.n} 선생님 — ${subj} ${t.c}과외 (${t.gr.join(', ')}) | ${S.brand}`;
  return page(S, { path: `t/${t.i}.html`, up, active: 'teachers', ld: { '@context': 'https://schema.org', '@graph': [crumbLd(S, [['홈', 'index.html'], ['선생님', 'teachers.html'], [`${t.n} 선생님`, `t/${t.i}.html`]])] },
    title, desc: `${t.n} 선생님 — ${t.tag || t.headline}. ${subj} ${t.c} 수업, ${where}. ${t.intro.slice(0, 80)}`,
    kw: `${subj} 과외 선생님, ${t.c}과외, ${t.regions.join(', ') || '화상과외'}` }, `
<section class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="${up}index.html">홈</a> › <a href="${up}teachers.html">선생님</a> › ${esc(t.n)} 선생님</div>
    <h1>${esc(t.n)} 선생님</h1>
    <p class="lead">${esc(where)} · ${esc(subj)} · ${esc(t.c)}과외${t.g ? ` · ${esc(t.g)}선생님` : ''}</p>
    ${t.p ? `<img class="td-photo" src="${up}${t.p}" alt="${esc(t.n)} 선생님" width="120" height="120">` : ''}
  </div>
</section>
<section>
  <div class="wrap td">
    <div class="article" style="margin:0;max-width:none">
      <h2>${esc(t.headline || t.tag)}</h2>
      ${t.intro ? `<p>${esc(t.intro)}</p>` : ''}${(t.b || []).length ? `<h3>경력</h3><ul>${t.b.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      <p>${esc(t.n)} 선생님은 ${esc(t.gr.join(', '))} 학생의 ${esc(subj)} 수업을 ${t.c === '방문+화상' ? '방문과 화상 모두' : t.c + '으로'} 진행합니다. 첫 상담에서 학생의 현재 상태를 듣고 수업 계획을 세운 뒤 시작하며, 첫 수업 후 맞지 않으면 다른 선생님을 함께 안내해 드립니다.</p>
${schools.length ? `<h2>${esc(t.n)} 선생님 방문 지역 학교</h2>
      ${cells(schools, s => `${up}pages/${s.slug}-과외.html`, '과외')}` : ''}
${similar.length ? `<h2>이런 선생님도 있어요</h2>
      <div class="t-grid">${similar.map(x => teacherCard(x, up)).join('\n')}</div>` : ''}
    </div>
    <aside>
      <div class="card">
        <h3>수업 정보</h3>
        <ul class="td-facts">
          <li><i>수업 방식</i><span>${esc(t.c)}과외</span></li>
          <li><i>과목·학년</i><span>${t.s.map((v, i) => `${esc(v)} <span class="muted">${esc(t.gr[i] || t.gr[0] || '')}</span>`).join('<br>')}</span></li>
          <li><i>수업 지역</i><span>${esc(where)}</span></li>
          ${t.g ? `<li><i>선생님</i><span>${esc(t.g)}선생님</span></li>` : ''}
        </ul>
        <a href="${up}contact.html?t=${t.i}" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:16px">${esc(t.n)} 선생님 상담 신청</a>
        <p class="small muted" style="margin:10px 0 0">신청하시면 선생님의 수업 가능 시간을 확인한 뒤 연락드립니다.</p>
      </div>
    </aside>
  </div>
</section>
${formSection(S, 'f_teacher', { title: `${t.n} 선생님 상담 신청`, lead: '학년·과목·사는 곳을 남겨 주시면 선생님 일정을 확인해 연락드립니다.' })}`);
}

/* ---------- 글 (수업 이야기 · 입시정보) ---------- */
function listPage(S, kind, posts) {
  const isBlog = kind === 'blog';
  const title = isBlog ? '수업 이야기' : '유학·입시정보';
  return page(S, { path: `${kind}.html`, up: '', active: kind, ld: { '@context': 'https://schema.org', '@graph': [crumbLd(S, [['홈', 'index.html'], [title, `${kind}.html`]])] },
    title: `${title} — ${isBlog ? '국제학교 과제·시험·공부법 이야기' : '국제학교 입학·커리큘럼·대학 진학 안내'} | ${S.brand}`,
    desc: isBlog ? 'IA 마감 관리, 영어 에세이 고쳐쓰기, 영어로 된 수학 문제 읽기처럼 실제 수업에서 나온 이야기를 적습니다.' : '국제학교 입학·편입, IB·AP·A-Level 과목 선택, 해외 대학 원서처럼 학부모가 먼저 알아야 할 정보를 정리합니다.',
    kw: isBlog ? '국제학교 과외 이야기, 국제학교 공부법, IA, 영어 에세이' : '국제학교 입학, 국제학교 편입, IB 과목 선택, 해외 대학 입시' }, `
<section class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="index.html">홈</a> › ${title}</div>
    <h1>${title}</h1>
    <p class="lead">${isBlog ? '수업에서 실제로 나온 질문과 방법을 정리합니다. 새 글이 계속 올라옵니다.' : '입학·커리큘럼·진학 정보를 학부모 눈높이로 정리합니다. 바뀌는 일정과 요건은 공식 안내로 꼭 확인하세요.'}</p>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="post-list">${posts.map(p => `<article class="post-item"><span class="cat">${esc(p.cat)}</span><time datetime="${p.date}">${p.date}</time><h3><a href="${kind}/${p.slug}.html">${esc(p.title)}</a></h3><p class="muted" style="margin:0">${esc(p.desc)}</p></article>`).join('\n')}</div>
  </div>
</section>
${ctaBand(S, '', '우리 아이 상황에 맞는 답이 필요하세요?', '학교·학년·과목을 알려 주시면 글이 아니라 아이 기준으로 상담해 드립니다.')}`);
}

function postPage(S, kind, p, posts) {
  const up = '../';
  const title = kind === 'blog' ? '수업 이야기' : '유학·입시정보';
  const others = posts.filter(x => x !== p).slice(0, 3);
  const ld = { '@context': 'https://schema.org', '@graph': [crumbLd(S, [['홈', 'index.html'], [title, `${kind}.html`], [p.title, `${kind}/${p.slug}.html`]]),
    { '@type': 'Article', headline: p.title, description: p.desc, datePublished: p.date, dateModified: p.date, author: { '@type': 'Organization', name: S.brand }, publisher: { '@type': 'Organization', name: S.brand }, mainEntityOfPage: abs(S, `${kind}/${p.slug}.html`) }] };
  return page(S, { path: `${kind}/${p.slug}.html`, up, active: kind, ld, title: `${p.title} | ${S.brand}`, desc: p.desc, kw: p.keywords || `${p.cat}, ${title}, ${S.brand}` }, `
<section class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="${up}index.html">홈</a> › <a href="${up}${kind}.html">${title}</a> › ${esc(p.cat)}</div>
    <h1>${esc(p.title)}</h1>
    <p class="lead"><time datetime="${p.date}">${p.date}</time> · ${esc(p.cat)}</p>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="article">
      ${p.body.trim()}
      <div class="hl-box">학교·학년·과목을 알려 주시면 아이 기준으로 상담해 드립니다 — 📞 <a href="tel:${TELRAW}"><b>${TEL}</b></a> · <a href="${up}contact.html">온라인 신청</a></div>
      ${others.length ? `<h2>다른 글</h2><ul>${others.map(x => `<li><a href="${x.slug}.html">${esc(x.title)}</a></li>`).join('')}</ul>` : ''}
    </div>
  </div>
</section>`);
}

/* ---------- 상담 ---------- */
function contactPage(S) {
  const ways = [
    ['📞', '전화 상담', TEL, `tel:${TELRAW}`],
    S.channelKey ? ['💬', '실시간 채팅', '오른쪽 아래 버튼', '#chat'] : null,
    S.kakao ? ['💛', '카카오톡 오픈채팅', '바로 대화', S.kakao] : null,
    ['📝', '온라인 신청', '아래 양식', '#apply']
  ].filter(Boolean);
  return page(S, { path: 'contact.html', up: '', active: '', ld: { '@context': 'https://schema.org', '@graph': [crumbLd(S, [['홈', 'index.html'], ['상담 신청', 'contact.html']])] },
    title: `무료 상담 신청 — 전화·채팅·카카오톡·온라인 | ${S.brand}`, desc: `${S.brand} 과외 상담. 전화 ${TEL}, 실시간 채팅, 카카오톡, 온라인 신청서. 학교·학년·과목만 알려주시면 24시간 안에 연락드립니다.` }, `
<section class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="index.html">홈</a> › 상담 신청</div>
    <h1>무료 상담 신청</h1>
    <p class="lead">전문 선생님이 곧 연락드립니다.</p>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="contact-ways">${ways.map(([i, h, s, href]) => `<a href="${href}"${href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''} data-way="${h}"><b>${i}</b>${h}<span>${esc(s)}</span></a>`).join('')}</div>
  </div>
</section>
${formSection(S, 'f_contact', {})}`);
}

/* ---------- 홈 (사이트마다 히어로 모양·섹션 순서가 다르다 — sites.js 의 theme.hero · home) ---------- */
const SUBJ_DESC = { 수학: 'IB Math·AP Calculus·IGCSE·A-Level', 영어: '문학 분석과 영어 에세이', 에세이: '과제 에세이부터 EE·원서 에세이까지', 과학: '랩 리포트와 영어 서술형', 물리: '역학·전자기, IA·AP Physics', 화학: '몰 계산부터 IB·AP Chemistry', 생물: '영어 용어와 자료 해석', 경제: '그래프·사례·평가 서술', SAT: '디지털 SAT 영역별 진단', 입학준비: '배치고사·MAP·인터뷰 준비' };
const HOME_FAQ = [
  ['학교 이름으로 찾았는데, 그 학교 선생님이 수업하나요?', '아닙니다. 그 학교의 커리큘럼과 과제 방식에 맞춰 수업할 수 있는 과외 선생님을 연결한다는 뜻입니다. 학교 소속 교사가 아니며, 학교와 제휴 관계도 아닙니다.'],
  ['해외에 사는데 수업이 되나요?', '됩니다. 해외 학생은 화상 수업으로 진행하고, 현지 시간 기준으로 학교가 끝난 뒤나 주말에 맞춥니다. 국내 국제학교 학생은 방문 수업도 상담할 수 있습니다.'],
  ['수업은 영어로 하나요, 한국어로 하나요?', '학생에게 맞춥니다. 개념은 한국어로 정확히 잡고, 학교에서 쓰는 영어 용어와 영어 서술로 다시 정리하는 방식을 많이 씁니다. 영어로만 수업받기를 원하면 그렇게 합니다.'],
  ['수업료는 어떻게 정해지나요?', '학년·과목·주당 횟수·수업 방식에 따라 다릅니다. 상담 때 조건을 듣고 정확한 금액을 안내드리며, 안내 전에는 비용이 생기지 않습니다.']
];

function indexPage(S, D, blog) {
  const up = '';
  const dark = S.theme.mode === 'dark';
  const kr = D.schools.filter(s => s.t === '국내').length, ab = D.schools.length - kr;
  const nations = new Set(D.schools.filter(s => s.t === '해외').map(s => s.sido)).size;
  const featured = D.teachers.filter(t => t.intro).concat(D.teachers.filter(t => !t.intro && !t.k)).slice(0, 6);
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'EducationalOrganization', name: S.brand, url: S.siteUrl + '/', telephone: '+82-' + TELRAW.replace(/^0/, ''), description: S.tagline, areaServed: '대한민국 및 해외' },
    { '@type': 'WebSite', name: S.brand, url: S.siteUrl + '/' }
  ] };
  const [l1, l2] = S.slogan;
  const h1 = `<h1>${esc(l1)}<br><em>${esc(l2)}</em></h1>`;
  const lead = `<p class="lead">${S.taglineLines.map(esc).join('<br class="pc"> ')}</p>`;
  const eyebrow = `<span class="eyebrow">${esc(S.en)} · ${profOf(S).tagSchools} ${D.schools.length.toLocaleString()}개교</span>`;
  const facts = `<div class="hero-facts"><div><b>${kr}</b><span>국내 국제학교</span></div><div><b>${ab}</b><span>해외 국제학교</span></div><div><b>${nations}</b><span>나라</span></div><div><b>${D.SUBJECTS_ALL.length}</b><span>과목</span></div></div>`;
  const cta = `<div class="hero-cta"><a href="${FINDER['국내'][1]}" class="btn btn-primary">우리 학교 찾기 →</a><a href="contact.html" class="btn btn-ghost">무료 상담 신청</a></div>`;
  const helpCard = `<div class="hero-side">
      <h3>어떤 도움이 필요하세요?</h3>
      <p>과목을 고르면 학교별 안내로 갑니다.<br>아래 버튼은 30초 간편 신청입니다.</p>
      <div class="chip-row">${D.SUBJECTS_HIGH.map(sub => `<a href="pages/${sub}과외-전체.html">${SUBJ[sub].icon} ${sub}</a>`).join('')}</div>
      <button type="button" class="btn btn-primary" id="quickOpen">30초 간편 상담 신청</button>
      <p class="small muted" style="margin:12px 0 0;text-align:center">📞 <a href="tel:${TELRAW}"><b>${TEL}</b></a> · 상담 무료</p>
    </div>`;

  const sidoLinks = D.SIDO_ORDER.filter(k => D.regions.some(r => r.sido === k));
  const popular = ['채드윅송도', 'NLCS제주', '브랭섬홀아시아', 'KIS판교', 'SFS', 'UWCSEA도버', 'HKIS', 'ISB방콕'].filter(sn => D.schools.some(s => s.sn === sn));
  const heroes = {
    magazine: () => `<div class="in">${eyebrow}${h1}${lead}${cta}${facts}</div>
      <ol class="hero-list">
        <li><b>학교 커리큘럼 기준으로</b><span>IB·AP·IGCSE·A-Level은 배우는 순서도 평가도 다릅니다. 학교 이름으로 찾으면 그 과정에 맞춰 수업을 짭니다.</span></li>
        <li><b>24시간 안에 선생님을 답합니다</b><span>학교·학년·과목을 남기면 그 커리큘럼을 가르쳐 본 선생님 2~3명을 추려 드립니다.</span></li>
        <li><b>해외는 화상, 국내는 방문까지</b><span>현지 시차에 맞춰 화상으로, 국내 국제학교는 방문 수업도 상담할 수 있습니다.</span></li>
      </ol>`,
    poster: () => `<div class="in">${eyebrow}${h1}${lead}${cta}${facts}</div>`,
    stats: () => `${eyebrow}${h1}${lead}${cta}
      <div class="hero-nums"><div><b>${kr}</b><span>국내 국제학교</span></div><div><b>${ab}</b><span>해외 국제학교</span></div><div><b>${nations}</b><span>나라</span></div><div><b>${D.SUBJECTS_ALL.length}</b><span>과목</span></div></div>`,
    tilesHero: () => `<div class="in">${eyebrow}${h1}${lead}${cta}${facts}</div>
      <div class="hero-tiles">${D.SUBJECTS_HIGH.map(sub => `<a href="pages/${sub}과외-전체.html"><b>${SUBJ[sub].icon}</b>${sub}과외</a>`).join('')}<a class="all" href="${FINDER['국내'][1]}">우리 학교로 바로 찾기 →</a></div>`,
    band: () => `<div class="in">${eyebrow}${h1}${lead}${cta}</div>${facts}`,
    regions: () => `<div class="in">${eyebrow}${h1}${lead}${cta}${facts}</div>
      <div class="hero-regions"><h3>나라·지역으로 바로 찾기</h3><p>아이가 있는 곳을 누르면 그 지역 국제학교 목록이 나옵니다.</p>
        <div class="sido">${sidoLinks.map(k => `<a href="regions.html#r-${k}">${k}</a>`).join('')}</div>
        <button type="button" class="btn btn-primary" id="quickOpen">30초 간편 상담 신청</button></div>`,
    split: () => `<div class="in">${eyebrow}${h1}${lead}${cta}${facts}</div>${helpCard}`,
    soft: () => `<div class="in">${eyebrow}${h1}${lead}${cta}${facts}</div>${helpCard}`,
    search: () => `${eyebrow}${h1}${lead}
      <form class="hero-search" action="${FINDER['국내'][1]}" method="get"><input name="q" placeholder="국제학교 이름을 입력하세요 (예: 채드윅, NLCS, UWCSEA)" aria-label="학교 이름" /><button type="submit">학교 찾기</button></form>
      <p class="hero-hint">인기 학교 ${popular.map(sn => `<a href="pages/${sn}-과외.html">${esc(sn)}</a>`).join('·')}<br>또는 <a href="${FINDER['해외'][1]}">해외 국제학교 찾기</a>·<a href="regions.html">나라·지역으로 찾기</a>·<a href="curriculum/index.html">커리큘럼별 안내</a><br><b>목록에 없는 학교도 수업 가능합니다</b> — <a href="contact.html">상담 신청</a></p>
      ${facts}`,
    teachers: () => `<div class="in">${eyebrow}${h1}${lead}${cta}${facts}</div>
      <div class="hero-stack">${featured.slice(0, 3).map(t => teacherCard(t, up)).join('')}<p class="more"><a href="teachers.html">선생님 ${D.teachers.length}명 모두 보기 →</a></p></div>`,
    form: () => `<div class="in">${eyebrow}${S.quote ? `<p class="quote">“${esc(S.quote)}”</p>` : ''}${h1}${lead}
      <div class="hero-cta"><a href="${FINDER['국내'][1]}" class="btn btn-primary">우리 학교 찾기 →</a><a href="tel:${TELRAW}" class="btn btn-ghost">📞 ${TEL}</a></div></div>
      <div class="hero-form">
        <h3>빠른 과외 신청</h3>
        <form id="f_hero">
          <div class="row2"><div class="field"><label for="f_hero_name">이름 *</label><input id="f_hero_name" required placeholder="홍길동" /></div>
          <div class="field"><label for="f_hero_phone">연락처 *</label><input id="f_hero_phone" required inputmode="tel" placeholder="010-0000-0000" /></div></div>
          <div class="field"><label for="f_hero_school">학교 *</label><input id="f_hero_school" required placeholder="예: 채드윅송도" /></div>
          <div class="row2"><div class="field"><label for="f_hero_grade">학년 *</label><select id="f_hero_grade" required><option value="">선택</option>${GRADES.map(g => `<option>${g}</option>`).join('')}</select></div>
          <div class="field"><label for="f_hero_subject">과목 *</label><select id="f_hero_subject" required><option value="">선택</option>${FORM_SUBJECTS.map(s => `<option>${s}</option>`).join('')}</select></div></div>
          <button type="submit" class="btn btn-primary">무료 상담 신청 →</button>
          <div class="ok" id="f_hero_ok">접수되었습니다. 24시간 안에 연락드립니다.</div>
          <p class="note">24시간 안에 연락 · 상담 무료</p>
        </form>
      </div>`
  };

  const head = (eb, title, leadTxt, link) => link
    ? `<div class="sec-head row"><div><span class="eyebrow">${eb}</span><h2>${title}</h2>${leadTxt ? `<p class="lead">${leadTxt}</p>` : ''}</div><a class="more-link" href="${link[0]}">${link[1]}</a></div>`
    : `<div class="sec-head center"><span class="eyebrow">${eb}</span><h2>${title}</h2>${leadTxt ? `<p class="lead center">${leadTxt}</p>` : ''}</div>`;

  const sp = specOf(S);
  const sections = {
    subjectsTiles: () => `${head('Subjects', '과목별 1:1 과외', '과목을 고르면 국제학교별 안내로 이동합니다.')}
    <div class="tiles">${D.SUBJECTS_HIGH.map(sub => `<a class="tile" href="pages/${sub}과외-전체.html"><b>${SUBJ[sub].icon}</b>${sub}과외</a>`).join('')}</div>`,
    subjectsList: () => `${head('Subjects', '과목별 1:1 과외', profOf(S).subjectsNote, [`pages/${S.subjectsAll[0]}과외-전체.html`, '전체 과목 보기'])}
    <div class="slist">${D.SUBJECTS_HIGH.map((sub, i) => `<a href="pages/${sub}과외-전체.html"><span class="no">${String(i + 1).padStart(2, '0')}</span><span><b>${sub}과외</b><em>${SUBJ_DESC[sub] || ''}</em></span><i>→</i></a>`).join('')}</div>`,
    curriculum: () => `${head('Curriculum', '커리큘럼별로 준비가 다릅니다', '아이 학교의 과정을 고르면 그에 맞춘 준비법이 나옵니다.', [`${sp.dir}/index.html`, '커리큘럼 전체 보기'])}
    <div class="grid g3">${sp.pages.map(p => `<a class="card" href="${sp.dir}/${p.key}.html" style="color:inherit"><h3>${esc(p.title)}</h3><p>${esc(p.lead)}</p></a>`).join('')}</div>`,
    stats: () => `<div class="stat-strip"><div class="stat"><b>${kr}</b><span>국내 국제학교</span></div><div class="stat"><b>${ab}</b><span>해외 국제학교</span></div><div class="stat"><b>${nations}</b><span>나라</span></div><div class="stat"><b>${D.regions.length}</b><span>지역</span></div></div>`,
    regions: () => `${head('Regions', '나라·지역별 국제학교 과외', '아이가 있는 나라를 고르고 도시를 누르세요.', ['regions.html', '지역 전체 보기'])}
    ${regionBoxes(D, up, true)}`,
    services: () => `${head('Services', `${esc(josa(S.brand, '이', '가'))} 하는 일`)}
    <div class="grid g4">${profOf(S).services
      .map(([ic, h, p], i) => `<div class="card">${dark ? `<span class="no">0${i + 1}</span>` : `<span class="ico">${ic}</span>`}<h3>${h}</h3><p>${p}</p></div>`).join('')}</div>`,
    steps: () => `${head('How it works', '수업은 이렇게 시작됩니다', '처음 과외를 알아보셔도 괜찮습니다. 다섯 단계면 됩니다.')}
    <div class="steps">${[['상담 신청', '학교·학년(Grade)·과목·사는 곳을 남깁니다'], ['선생님 추천', '그 커리큘럼을 가르쳐 본 2~3명을 24시간 안에 안내'], ['첫 수업', '성적표·과제 피드백을 보고 수업 계획을 세웁니다'], ['정기 수업', '학교 과제 마감과 시험 일정에 맞춰 진행'], ['점검', '학기 성적과 피드백을 보고 계획을 조정']].map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('')}</div>`,
    teachers: () => D.teachers.length ? `${head('Teachers', '선생님을 먼저 보고 싶다면', `선생님 ${D.teachers.length}명 가운데 일부입니다.`, ['teachers.html', '선생님 전체 보기'])}
    <div class="t-grid">${featured.map(t => teacherCard(t, up)).join('\n')}</div>` : `${head('Teachers', '선생님을 먼저 보고 싶다면', '학교·커리큘럼에 맞는 선생님을 상담 때 2~3명 골라 소개해 드립니다.', ['teachers.html', '선생님 페이지'])}`,
    faq: () => `${head('FAQ', '학부모님이 자주 묻는 질문')}
    <div class="faq-list" style="max-width:820px;margin:0 auto">${HOME_FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`,
    journal: () => blog.length ? `${head('Journal', '수업 이야기', '', ['blog.html', '글 더 보기'])}
    <div class="post-list">${blog.slice(0, 3).map(p => `<article class="post-item"><span class="cat">${esc(p.cat)}</span><time datetime="${p.date}">${p.date}</time><h3><a href="blog/${p.slug}.html">${esc(p.title)}</a></h3><p class="muted" style="margin:0">${esc(p.desc)}</p></article>`).join('')}</div>` : ''
  };

  const body = S.home.map(k => sections[k]()).filter(Boolean).map((html, i) => `<section${i % 2 === 0 ? ' class="soft"' : ''}>
  <div class="wrap">
    ${html}
  </div>
</section>`).join('\n');

  return page(S, { path: 'index.html', up, active: 'home', ld,
    title: `${S.brand} — ${profOf(S).homeTitle}`,
    desc: `${S.tagline} 국내 국제학교 ${kr}곳·해외 ${nations}개 나라 ${ab}곳 학교별 과목 안내, ${profOf(S).homeExtra}. 무료 상담 ${TEL}.`,
    kw: profOf(S).homeKw }, `
<section class="hero">
  <div class="wrap">
    ${heroes[S.theme.hero]()}
  </div>
</section>
${body}
${formSection(S, 'f_home', {})}`);
}

function notFoundPage(S) {
  return page(S, { path: '404.html', up: '/', active: '', noindex: true, title: `페이지를 찾을 수 없습니다 | ${S.brand}`, desc: '주소가 바뀌었거나 없는 페이지입니다.' }, `
<section class="center"><div class="wrap"><h1>페이지를 찾을 수 없습니다</h1><p class="lead">주소를 다시 확인해 주세요. 학교 이름으로 찾으시려면 아래 버튼을 눌러 주세요.</p>
<div class="hero-cta" style="justify-content:center"><a href="/pages/국내국제학교찾기.html" class="btn btn-primary">국제학교 찾기</a><a href="/" class="btn btn-ghost">홈으로</a></div></div></section>`);
}

/* ---------- 전문 메뉴 (reading 프로필 '논술' · science 프로필 '최상위 과학') — 회화 페이지와 같은 틀 ---------- */
function specTabs(P, active) { return `<div class="lang-tabs">${P.pages.map(p => `<a href="${p.key}.html"${p.key === active ? ' class="active"' : ''}>${esc(p.name)}</a>`).join('')}</div>`; }
function specIndexPage(S) {
  const P = specOf(S), up = '../';
  return page(S, { path: `${P.dir}/index.html`, up, active: 'conv', ld: { '@context': 'https://schema.org', '@graph': [crumbLd(S, [['홈', 'index.html'], [P.menu, `${P.dir}/index.html`]])] },
    title: `${P.title} | ${S.brand}`, desc: P.lead, kw: P.pages.map(p => p.name).join(', ') + ', ' + S.brand }, `
<section class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="${up}index.html">홈</a> › ${esc(P.menu)}</div>
    <h1>${esc(P.h1)}</h1>
    <p class="lead">${esc(P.lead)}</p>
    ${specTabs(P, '')}
  </div>
</section>
<section>
  <div class="wrap">
    <div class="grid g3">${P.pages.map(p => `<a class="card" href="${p.key}.html" style="color:inherit"><h3>${esc(p.title)}</h3><p>${esc(p.lead)}</p></a>`).join('\n')}</div>
  </div>
</section>
<section class="soft">
  <div class="wrap">
    <h2 class="center">어떻게 수업하나요?</h2>
    <div class="grid g2" style="margin-top:20px">${SPEC.HOW.map(([h, p]) => `<div class="card"><h3>${h}</h3><p>${esc(p)}</p></div>`).join('')}</div>
  </div>
</section>
${formSection(S, 'f_spec', { title: '무료 상담 신청', lead: '전문 선생님이 곧 연락드립니다.' })}`);
}
function specPage(S, L) {
  const P = specOf(S), up = '../';
  const ld = { '@context': 'https://schema.org', '@graph': [crumbLd(S, [['홈', 'index.html'], [P.menu, `${P.dir}/index.html`], [L.title, `${P.dir}/${L.key}.html`]]), faqLd(L.faq)] };
  return page(S, { path: `${P.dir}/${L.key}.html`, up, active: 'conv', ld, title: `${L.title} — 1:1 방문·화상 | ${S.brand}`, desc: L.lead, kw: L.kw }, `
<section class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="${up}index.html">홈</a> › <a href="index.html">${esc(P.menu)}</a> › ${esc(L.name)}</div>
    <h1>${esc(L.h1)}</h1>
    <p class="lead">${esc(L.lead)}</p>
    ${specTabs(P, L.key)}
    <div class="hero-cta"><a href="#apply" class="btn btn-primary">무료 상담 신청 →</a><a href="tel:${TELRAW}" class="btn btn-ghost">📞 ${TEL}</a></div>
  </div>
</section>
<section>
  <div class="wrap">
    <h2>${esc(L.name)} 1:1 과외를 선택하는 2가지 이유</h2>
    <div class="grid g2">${L.reasons.map(([h, p], i) => `<div class="card"><span class="ico">0${i + 1}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div>
  </div>
</section>
<section class="soft">
  <div class="wrap">
    <h2>어떻게 수업하나요?</h2>
    <p class="lead">학생 환경에 맞춰 방문 또는 화상 중 하나를 고릅니다. 섞어서 진행해도 됩니다.</p>
    <div class="grid g2">${SPEC.HOW.map(([h, p]) => `<div class="card"><h3>${h}</h3><p>${esc(p)}</p></div>`).join('')}</div>
  </div>
</section>
<section>
  <div class="wrap">
    <h2>수업 과정</h2>
    <div class="grid g2">${SPEC.PLANS.map(([h, p, opts]) => `<div class="card"><h3>${h}</h3><p>${esc(p)}</p><div class="t-sub" style="margin-top:10px">${opts.map(o => `<b>${o}</b>`).join('')}</div></div>`).join('')}</div>
  </div>
</section>
<section class="soft">
  <div class="wrap">
    <h2>이런 수업을 합니다</h2>
    <div class="types">${L.types.map(([g, items]) => `<div><h4>${esc(g)}</h4>${items.map(x => `<span>${esc(x)}</span>`).join('')}</div>`).join('')}</div>
  </div>
</section>
<section>
  <div class="wrap">
    <h2>자주 묻는 질문</h2>
    <div class="faq-list">${L.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n')}</div>
  </div>
</section>
${formSection(S, 'f_spec', { title: `${L.name} 무료 상담 신청`, lead: '전문 선생님이 곧 연락드립니다.' })}`);
}

module.exports = { hubPage, subjectPage, regionPage, schoolFinderPage, subjectIndexPage, regionsIndexPage, teachersPage, teacherPage, specIndexPage, specPage, FINDER, listPage, postPage, contactPage, indexPage, notFoundPage,
  hubFile, subFile, regionFile, subjIndexFile, encPath, TODAY, BLOG, ADMISSIONS };
