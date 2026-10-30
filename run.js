/* 국제학교 × 과목 과외 사이트 — 실제 파일 쓰기 (과외사이트 복제키트 생성기를 국제학교용으로 바꿈, 2026-10-27)
   실행: ELECTRON_RUN_AS_NODE=1 Code.exe run.js [출력루트]      (기본: 이 폴더의 출력/ → 출력/<repo>/)
        ONLY=<repo> 처럼 주면 그 사이트만.  SAMPLE=1 이면 국내 + 싱가포르 + 미국 학교만(미리보기용, 출력은 <루트>/_sample/<repo>/)
   출력 폴더의 pages/ · t/ 는 전부 생성기 소유(이번에 안 만든 파일은 지운다). blog/ · admissions/ 는 데일리가 글을 더하므로 지우지 않는다. */
const fs = require('fs');
const path = require('path');
const { SITES, TEL, TELRAW } = require('./sites');
const { buildCss } = require('./css');
const B = require('./build');
const { load } = require('./data');

const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const SAMPLE = !!process.env.SAMPLE;
/* POSTS_ONLY=1 : 데일리 글만 빠르게 반영(홈·글 목록·글 페이지·RSS·sitemap-main 만 다시 쓴다, 5만 장은 건드리지 않음) — 새글.js 가 켠다 */
const POSTS_ONLY = !!process.env.POSTS_ONLY;
const OUT_ROOT = process.argv[2] || path.join(__dirname, '출력');   // 출력/<repo>/ 에 사이트가 생긴다
/* 데이터는 프로필마다 한 번만 읽는다 */
const { PROFILES } = require('./profiles');
const SPEC = require('./specialty');
const DCACHE = {};
function dataFor(S) {
  const k = S.profile || 'intl';
  if (DCACHE[k]) return DCACHE[k];
  const P = PROFILES[k];
  const D = load({ levels: P.levels, subjectsFor: P.subjectsFor, teacherSubjects: P.teacherSubjects });
  if (SAMPLE) {                              // 미리보기: 국내 전체 + 싱가포르 + 미국 (목록 모양을 볼 만큼만)
    const keep = s => s.t === '국내' || s.sido === '싱가포르' || s.sido === '미국';
    D.schools = D.schools.filter(keep);
    D.regions = D.regions.filter(r => r.schools.some(keep));
  }
  D.regionOf = new Map(D.regions.map(r => [r.key, r]));
  return (DCACHE[k] = D);
}

/* 파일 쓰기 — 내용이 바뀐 파일만 (사이트맵 lastmod 용) */
function makeWriter() {
  const made = new Set(), changed = new Set();
  const W = (p, s) => {
    made.add(path.resolve(p));
    fs.mkdirSync(path.dirname(p), { recursive: true });
    if (fs.existsSync(p) && fs.readFileSync(p, 'utf8') === s) return;
    fs.writeFileSync(p, s, 'utf8'); changed.add(path.resolve(p));
  };
  return { W, made, changed };
}

/* 사이트맵 lastmod = 파일의 마지막 커밋 날짜(저장소가 있으면), 없거나 새 파일이면 오늘 */
function gitDates(dir) {
  const map = new Map();
  try {
    const out = require('child_process').execSync('git -c core.quotepath=false log --format=%cs --name-only', { cwd: dir, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    let d = '';
    for (const line of out.split('\n')) { const t = line.trim(); if (!t) continue; if (/^\d{4}-\d{2}-\d{2}$/.test(t)) { d = t; continue; } if (!map.has(t)) map.set(t, d); }
  } catch (_) {}
  return map;
}

/* ---------- 사이트별 작은 스크립트 ---------- */
/* 상담폼이 POST 로 보내는 곳(구글 Apps Script 웹앱, 03_생성기_사용법.md 6절). 비어 있으면 폼은 "접수" 문구만 보이고 아무 데도 보내지 않는다 — 우리 시트 주소를 넣기 전까지 비워 둔다 */
const HUB = process.env.FORM_ENDPOINT || 'https://script.google.com/macros/s/AKfycbx7cFmG03i-dpfj7IWynETu5Z2af_dla1qaA-Kt8KbFF28H-4Re684VpmO7vBSeaILU/exec';   // 티쳐포유 시트로 통합(2026-10-30) — "국제학교" 탭에 쌓이고 메일 알림. 코드는 ../상담폼_구글시트_코드.gs

const formJs = S => `/* ${S.brand} — 상담 신청 → 구글 시트 "웹 문의" (허브 Apps Script, sheet=${S.sheetTab})  ※ 생성기 출력물(생성기 폴더) — 손으로 고치지 말 것
   탭 이름을 바꾸려면 sites.js 의 sheetTab 을 고치고 재생성. 오타가 나면 시트에 새 탭이 조용히 생긴다. */
var SHEET_ENDPOINT = "${HUB}";
var SHEET_TAB = ${JSON.stringify(S.sheetTab)};
var SITE_NAME = ${JSON.stringify(S.brand)};
(function(){
  function val(id){ var el = document.getElementById(id); return el ? String(el.value).trim() : ""; }
  function send(payload){
    if (!SHEET_ENDPOINT) return Promise.resolve();
    return fetch(SHEET_ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }, body: new URLSearchParams(payload).toString() });
  }
  var tParam = new URLSearchParams(location.search).get("t") || "";
  [].slice.call(document.querySelectorAll("form[id]")).forEach(function(form){
    var id = form.id;
    if (!document.getElementById(id + "_name")) return;
    if (tParam) { var memo = document.getElementById(id + "_memo"); if (memo && !memo.value) memo.value = "선생님 번호 " + tParam + " 상담 희망"; }
    form.addEventListener("submit", async function(e){
      e.preventDefault();
      var req = ["_name","_phone","_school","_grade","_subject"];
      for (var i = 0; i < req.length; i++){
        if (!val(id + req[i])) { alert("필수 항목을 모두 입력해 주세요."); var el = document.getElementById(id + req[i]); if (el) el.focus(); return; }
      }
      var payload = {
        sheet: SHEET_TAB, _form: SITE_NAME, _time: new Date().toLocaleString("ko-KR"),
        사이트: SITE_NAME, 지역: val(id+"_area"),
        이름: val(id+"_name"), 연락처: val(id+"_phone"), 학교: val(id+"_school"),
        학년: val(id+"_grade"), 과목: val(id+"_subject"), 수업방식: val(id+"_mode"),
        읍면동: val(id+"_area"), 선생님성별: val(id+"_gender"), 남길말: val(id+"_memo"),
        신청페이지: location.origin + location.pathname,
        /* 영문 이름 — 티쳐포유 Apps Script 는 영문 키만 읽는다(2026-10-27). 한글 키와 같이 보낸다 */
        name: "[" + SITE_NAME + "] " + val(id+"_name"), phone: val(id+"_phone"), grade: val(id+"_grade"), subject: val(id+"_subject"), address: val(id+"_area"),
        memo: "[" + SITE_NAME + "] 학교: " + val(id+"_school") + (val(id+"_mode") ? " / " + val(id+"_mode") : "") + (val(id+"_gender") ? " / 선생님 " + val(id+"_gender") : "") + (val(id+"_memo") ? " / " + val(id+"_memo") : "") + " / " + location.pathname
      };
      var btn = form.querySelector('button[type="submit"]'); var orig = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "접수 중…"; }
      try { await send(payload); } catch (_) {}
      var ok = document.getElementById(id + "_ok"); if (ok) ok.style.display = "block";
      if (btn) btn.textContent = "신청 완료 ✓";
      if (typeof gtag === "function") gtag("event", "form_submit", { form: id });
    });
  });
})();
`;

/* 간편선택 팝업 — 지역과외 생성기의 본문(BODY)을 그대로 가져다 쓰고 앞머리 설정만 바꾼다 */
function quickJs(S, D) {
  const P = PROFILES[S.profile || 'intl'], sp = SPEC.PROFILES[S.profile || 'intl'];
  const TILE_DESC = { 수학: 'IB·AP·IGCSE 수학, 영어로 된 문제까지', 영어: '문학 분석과 영어 에세이', 에세이: '과제 에세이·EE·원서 에세이 구성', 과학: '랩 리포트와 영어 서술형', 물리: 'IB·AP Physics, 계산과 IA', 화학: '몰 계산부터 IB·AP Chemistry', 생물: '영어 용어와 자료 해석', 경제: '그래프·사례·평가 서술', SAT: '디지털 SAT 영역별 진단', 입학준비: '배치고사·MAP·인터뷰 준비' };
  const src = fs.readFileSync(path.join(__dirname, '공용/quickpick.js'), 'utf8');
  const m = src.match(/const BODY = String\.raw`([\s\S]*?)`;\s*[\r\n]/);
  if (!m) throw new Error('quickpick.js 에서 BODY 를 찾지 못함');
  const tiles = [...D.SUBJECTS_ALL.map(sub => [`${sub}과외`, require('./copy').SUBJ[sub].icon, TILE_DESC[sub] || `${sub} 과제·시험을 학교 커리큘럼 기준으로`]), ...P.quickExtra];
  const cfg = { ep: HUB, tab: S.sheetTab, site: S.brand, area: '', tel: TEL, telRaw: TELRAW, hasVisit: true, dongs: [], tiles,
    grades: ['K~G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12', '입학 예정'],
    links: [['국제학교 찾기', `${S.siteUrl}/pages/국내국제학교찾기.html`], ['선생님 보기', `${S.siteUrl}/teachers.html`], [sp.menu, `${S.siteUrl}/${sp.dir}/index.html`]] };
  /* 주소에 ?nopop 이 있으면 자동 팝업을 띄우지 않는다(미리보기 캡처용) */
  return `/* ${S.brand} — 간편선택 팝업 (생성기 출력물: 생성기 폴더, 본문은 지역과외/quickpick.js 공용). 손으로 고치지 말 것. */\nwindow.QCFG=${JSON.stringify(cfg)};\ntry { if (/[?&]nopop/.test(location.search)) sessionStorage.setItem('qpick', '1'); } catch (_) {}\n${m[1]}`;
}

const appJs = `/* 공용 동작 — 모바일 메뉴 · 학교 검색 · 선생님 필터 (생성기 출력물, 손으로 고치지 말 것) */
(function(){
  var norm = function(s){ return String(s||'').replace(/\\s+/g,'').toLowerCase(); };
  var mb = document.querySelector('[data-menu]'), mn = document.querySelector('[data-mnav]');
  if (mb && mn) {
    /* 모바일 메뉴: 데스크톱 목록(.nav-links)을 복사해 한 번만 만든다 */
    var built = false;
    mb.addEventListener('click', function(){
      if (!built) {
        built = true; var h = '';
        [].slice.call(document.querySelectorAll('.nav-links > li')).forEach(function(li){
          var a = li.querySelector(':scope > a'); h += '<a href="' + a.getAttribute('href') + '">' + a.textContent + '</a>';
          var sub = li.querySelector('.sub'); if (sub) h += '<div class="m-sub">' + sub.innerHTML + '</div>';
        });
        mn.innerHTML = h + '<a href="' + mn.dataset.tel + '">상담신청 · ${TEL}</a>';
      }
      mn.classList.toggle('open');
    });
  }

  /* 학교 목록 검색: 학교 이름 또는 도시 이름으로 거른다. 시군구 이름이 맞으면 그 줄 전체를 보여 준다.
     빈 시군구 줄·빈 시도 묶음은 숨긴다. 주소에 ?q=동래고 가 있으면(search 히어로의 홈 검색창) 바로 거른다. */
  var q = document.getElementById('q'), finder = document.getElementById('finder');
  if (q && finder) {
    var cities = [].slice.call(finder.querySelectorAll('[data-city]')), blocks = [].slice.call(finder.querySelectorAll('[data-block]'));
    var cnt = document.getElementById('cnt');
    var run = function(){
      var v = norm(q.value), n = 0;
      cities.forEach(function(c){
        var cityHit = v && norm(c.querySelector('h3 a').textContent).indexOf(v) > -1, any = false;
        [].slice.call(c.querySelectorAll('.sgrid a')).forEach(function(a){
          var ok = !v || cityHit || norm(a.textContent).indexOf(v) > -1;
          a.classList.toggle('is-off', !ok); if (ok) { any = true; n++; }
        });
        c.classList.toggle('is-off', !any);
      });
      blocks.forEach(function(b){ b.classList.toggle('is-off', !b.querySelector('[data-city]:not(.is-off)')); });
      if (cnt) {
        if (!v) cnt.innerHTML = '';
        else if (n) cnt.textContent = n + '개 학교';
        else if (q.dataset.other) cnt.innerHTML = '목록에 없어도 수업 가능합니다 — <a href="/contact.html">상담 신청 →</a> · <a href="' + q.dataset.other + '?q=' + encodeURIComponent(q.value) + '">' + q.dataset.otherName + '에서 찾기</a>';
        else cnt.innerHTML = '목록에 없어도 수업 가능합니다 — <a href="/contact.html">상담 신청 →</a>';
      }
    };
    q.addEventListener('input', run);
    try { var pre = new URLSearchParams(location.search).get('q'); if (pre) { q.value = pre; run(); } } catch (_) {}
  }

  /* 시도 탭 (홈 지역 목록): 버튼을 누르면 그 시도 상자만 보인다 (HTML 에는 전부 들어 있어 검색엔진은 다 읽는다) */
  [].slice.call(document.querySelectorAll('[data-tabs]')).forEach(function(bar){
    var panels = [].slice.call(bar.parentNode.querySelectorAll('[data-panel]'));
    bar.addEventListener('click', function(e){
      var b = e.target.closest('button'); if (!b) return;
      [].slice.call(bar.children).forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      panels.forEach(function(p){ p.classList.toggle('is-off', p.dataset.panel !== b.dataset.tab); });
    });
  });

  /* 선생님 필터 */
  var grid = document.getElementById('tgrid');
  if (grid) {
    var cards = [].slice.call(grid.children), state = { s: '', c: '', sd: '' }, tc = document.getElementById('tcnt');
    var apply = function(){
      var n = 0;
      cards.forEach(function(c){
        var ok = (!state.s || (c.dataset.s||'').split(',').indexOf(state.s) > -1) && (!state.c || (c.dataset.c||'').indexOf(state.c) > -1) && (!state.sd || c.dataset.sd === state.sd || (state.c !== '방문' && c.dataset.sd === '전국'));
        c.classList.toggle('hidden', !ok); if (ok) n++;
      });
      if (tc) tc.textContent = n;
    };
    [].slice.call(document.querySelectorAll('[data-filter]')).forEach(function(group){
      var key = group.dataset.filter;
      group.addEventListener('click', function(e){
        var b = e.target.closest('button'); if (!b) return;
        [].slice.call(group.children).forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        state[key] = b.dataset.v || ''; apply();
      });
    });
  }

  /* 상담 페이지 — 채팅 카드는 채널톡 버튼을 눌러 준다 */
  var chat = document.querySelector('[data-way="실시간 채팅"]');
  if (chat) chat.addEventListener('click', function(e){ e.preventDefault(); var b = document.querySelector('.ch-fab'); if (b) b.click(); });
})();
`;

const analyticsJs = S => `// Google Analytics 4 — 측정 ID 를 발급받으면 sites.js 의 gaId 에 넣고 재생성 ()
(function () {
  var GA_ID = ${JSON.stringify(S.gaId || '')};
  if (!GA_ID) return;
  var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID; document.head.appendChild(s);
  window.dataLayer = window.dataLayer || []; function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag; gtag('js', new Date()); gtag('config', GA_ID);
})();
// 네이버 애널리틱스 — 사이트 ID 는 sites.js 의 naverWa (2026-10-21, 네이버 검색어별 유입을 보려고 추가. 구글은 네이버 검색어를 못 본다)
(function () {
  var WA = ${JSON.stringify(S.naverWa || '')};
  if (!WA) return;
  window.wcs_add = window.wcs_add || {}; window.wcs_add["wa"] = WA;
  var s = document.createElement('script'); s.src = 'https://wcs.pstatic.net/wcslog.js';
  s.onload = function () { if (window.wcs) { try { window.wcs_do(); } catch (e) {} } };
  document.head.appendChild(s);
})();

`;

/* 채널톡 — 국제학교 channeltalk.js 와 같은 방식(기본 버튼 숨기고 자체 버튼), 키만 사이트별 */
const channelJs = S => `// ===== 채널톡 연동 — ${S.brand} 전용 채널 (키는 sites.js channelKey) =====
(function(){
  (function(){var w=window;if(w.ChannelIO){return w.console.error("ChannelIO script included twice.");}var ch=function(){ch.c(arguments);};ch.q=[];ch.c=function(args){ch.q.push(args);};w.ChannelIO=ch;function l(){if(w.ChannelIOInitialized){return;}w.ChannelIOInitialized=true;var s=document.createElement("script");s.type="text/javascript";s.async=true;s.src="https://cdn.channel.io/plugin/ch-plugin-web.js";var x=document.getElementsByTagName("script")[0];if(x.parentNode){x.parentNode.insertBefore(s,x);}}if(document.readyState==="complete"){l();}else{w.addEventListener("DOMContentLoaded",l);w.addEventListener("load",l);}})();
  function init(){
    var st=document.createElement("style");
    st.textContent=".ch-fab{position:fixed;right:20px;bottom:84px;z-index:70;display:inline-flex;align-items:center;gap:7px;background:${S.theme.primary};color:#fff;font-family:inherit;font-weight:800;font-size:15px;padding:13px 20px;border-radius:999px;border:0;cursor:pointer;white-space:nowrap;box-shadow:0 6px 20px rgba(0,0,0,.22)}.ch-fab:hover{transform:translateY(-2px)}.ch-fab .ch-badge{display:none;position:absolute;top:-6px;right:-4px;min-width:19px;height:19px;background:#e5304c;color:#fff;border-radius:999px;font-size:11px;font-weight:800;line-height:19px;text-align:center;padding:0 5px}@media (max-width:640px){.ch-fab{bottom:76px;right:14px;padding:11px 16px;font-size:14px}}";
    document.head.appendChild(st);
    var btn=document.createElement("button");btn.type="button";btn.className="ch-fab";btn.setAttribute("aria-label","실시간 채팅 상담");btn.innerHTML="💬 실시간 상담<span class=\\"ch-badge\\"></span>";
    btn.addEventListener("click",function(){if(typeof gtag==="function")gtag("event","channeltalk_open");});
    document.body.appendChild(btn);
    ChannelIO("boot",{pluginKey:${JSON.stringify(S.channelKey)},customLauncherSelector:".ch-fab",hideChannelButtonOnBoot:true,zIndex:120});
    ChannelIO("onBadgeChanged",function(unread){var b=btn.querySelector(".ch-badge");if(!b)return;if(unread>0){b.style.display="block";b.textContent=unread>9?"9+":unread;}else{b.style.display="none";}});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
`;

/* 파비콘 — 브랜드마다 다른 기호— sites.js 에 favicon: 'mark01' 처럼 적으면 그 마크를 쓰고, 없으면 둥근 사각형. 16px 에서도 읽히게 굵은 도형만 쓴다.
   favicon.ico·apple-touch-icon.png·favicon-192.png 은 favicon-make.ps1 이 이 SVG 를 그려서 만든다(머리태그 안 바꿔도 브라우저·네이버·아이폰이 루트에서 찾는다). */
const faviconSvg = S => {
  const p = S.theme.primary, a = S.theme.accent;
  const marks = {
    /* ----- 2026-10-24 추가 6곳 ----- */
    /* 마크 01 — 코발트 바탕, 하늘색 말풍선 + 흰 물음표 */
    mark01: `<rect width="64" height="64" rx="14" fill="${p}"/><path d="M16 18 h32 a4 4 0 0 1 4 4 v18 a4 4 0 0 1 -4 4 h-18 l-9 7 v-7 h-5 a4 4 0 0 1 -4 -4 v-18 a4 4 0 0 1 4 -4z" fill="${a}"/><text x="32" y="39" font-family="Arial,sans-serif" font-size="22" font-weight="900" fill="#fff" text-anchor="middle">?</text>`,
    /* 마크 02 — 검정 바탕, 라임 산봉우리와 깃발 */
    mark02: `<rect width="64" height="64" rx="6" fill="${p === '#d9f99d' ? '#121212' : p}"/><path d="M8 50 L26 22 L36 36 L44 28 L56 50 Z" fill="${p}"/><path d="M44 28 V14 h10 l-3 4 3 4 h-10" fill="${a}"/>`,
    /* 마크 03 — 코랄 바탕, 흰 별 */
    mark03: `<rect width="64" height="64" rx="20" fill="${p}"/><path d="M32 10 l6.6 14.2 15.4 1.6 -11.5 10.5 3.2 15.3 -13.7 -7.8 -13.7 7.8 3.2 -15.3 -11.5 -10.5 15.4 -1.6z" fill="#fff"/>`,
    /* 마크 04 — 오렌지 바탕, 흰 쇼핑백 + 틸 책 */
    mark04: `<rect width="64" height="64" rx="14" fill="${p}"/><path d="M16 24 h32 l-3 28 h-26z" fill="#fff"/><path d="M24 24 v-4 a8 8 0 0 1 16 0 v4" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/><rect x="25" y="33" width="14" height="11" rx="1.5" fill="${a}"/><path d="M32 33 v11" stroke="#fff" stroke-width="1.5"/>`,
    /* 마크 05 — 검정 바탕, 금색 다이아몬드 */
    mark05: `<rect width="64" height="64" fill="${p}"/><path d="M20 20 h24 l10 12 -22 24 -22 -24z" fill="none" stroke="${a}" stroke-width="3" stroke-linejoin="round"/><path d="M10 32 h44 M20 20 l12 36 12 -36 M26 20 l6 12 6 -12" fill="none" stroke="${a}" stroke-width="2"/>`,
    /* 마크 06 — 자두 바탕, 살구색 위치 핀 + 흰 집 */
    mark06: `<rect width="64" height="64" rx="10" fill="${p}"/><path d="M32 8 a16 16 0 0 1 16 16 c0 12 -16 30 -16 30 s-16 -18 -16 -30 a16 16 0 0 1 16 -16z" fill="${a}"/><path d="M32 16 l-8 7 h3 v7 h10 v-7 h3z" fill="#fff"/>`,
    /* ----- 2026-10-24 과목 전문 2곳 ----- */
    /* 마크 07 — 짙은 녹색 바탕, 크림색 펼친 책 + 머스터드 책갈피 */
    mark07: `<rect width="64" height="64" rx="8" fill="${p}"/><path d="M12 18 q10 -4 20 2 v30 q-10 -6 -20 -2z" fill="#fbf7ee"/><path d="M52 18 q-10 -4 -20 2 v30 q10 -6 20 -2z" fill="#fbf7ee" opacity=".85"/><path d="M32 20 v30" stroke="${p}" stroke-width="2"/><path d="M40 12 h8 v18 l-4 -4 -4 4z" fill="${a}"/>`,
    /* 마크 08 — 짙은 청록 바탕, 민트 원자 궤도 + 시안 핵 */
    mark08: `<rect width="64" height="64" rx="16" fill="${p === '#3ee6b0' ? '#0b1a1f' : p}"/><ellipse cx="32" cy="32" rx="22" ry="9" fill="none" stroke="${p}" stroke-width="3"/><ellipse cx="32" cy="32" rx="22" ry="9" fill="none" stroke="${p}" stroke-width="3" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="22" ry="9" fill="none" stroke="${p}" stroke-width="3" transform="rotate(120 32 32)"/><circle cx="32" cy="32" r="5.5" fill="${a}"/>`,
    /* 마크 09 — 네이비 바탕, 금빛 과녁(센터) */
    mark09: `<rect width="64" height="64" rx="16" fill="${p}"/><circle cx="32" cy="32" r="17" fill="none" stroke="${a}" stroke-width="3.5"/><circle cx="32" cy="32" r="8.5" fill="none" stroke="#fff" stroke-width="3"/><circle cx="32" cy="32" r="3" fill="${a}"/>`,
    /* 마크 10 — 딥 틸 원, 흰 24, 앰버 점(시계) */
    mark10: `<circle cx="32" cy="32" r="30" fill="${p}"/><text x="31" y="41" font-family="Pretendard,Arial,sans-serif" font-size="26" font-weight="800" fill="#fff" text-anchor="middle" letter-spacing="-1">24</text><circle cx="50" cy="15" r="5" fill="${a}"/>`,
    /* 마크 11 — 보라→핑크 그라데이션, 점 세 개를 잇는 네트워크 */
    mark11: `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><path d="M20 42 L32 20 L44 42 Z" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="20" r="6" fill="#fff"/><circle cx="20" cy="42" r="6" fill="#fff"/><circle cx="44" cy="42" r="6" fill="#fff"/>`,
    /* 마크 12 — 버건디 바탕, 로즈골드 플라스크(연구소) */
    mark12: `<rect width="64" height="64" rx="8" fill="${p}"/><path d="M26 14 h12 M28 14 v12 L17 44 a4 4 0 0 0 3.5 6 h23 a4 4 0 0 0 3.5 -6 L36 26 V14" fill="none" stroke="${a}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22.5 36 h19 l4.5 8 a2 2 0 0 1 -1.8 3 h-24.4 a2 2 0 0 1 -1.8 -3 z" fill="${a}"/>`,
    /* 마크 13 — 녹색 바탕, 흰 새싹과 머스터드 후광 */
    /* 마크 14 — 버건디 바탕, 로즈골드 지구본(위도·경도선) */
    mark14: `<rect width="64" height="64" rx="12" fill="${p}"/><circle cx="32" cy="32" r="19" fill="none" stroke="${a}" stroke-width="3.5"/><ellipse cx="32" cy="32" rx="8" ry="19" fill="none" stroke="${a}" stroke-width="3"/><path d="M13 32 h38 M16 22 h32 M16 42 h32" stroke="#fff" stroke-width="2.4"/>`,
    mark13: `<rect width="64" height="64" rx="20" fill="${p}"/><ellipse cx="32" cy="15" rx="11" ry="3.5" fill="none" stroke="${a}" stroke-width="3"/><path d="M32 52 V30" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M32 34 C32 26 26 22 18 23 C18 31 24 36 32 34 Z" fill="#fff"/><path d="M32 40 C32 32 38 28 46 29 C46 37 40 42 32 40 Z" fill="#fff"/>`
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${marks[S.favicon || S.repo] || `<rect width="64" height="64" rx="14" fill="${p}"/>`}</svg>\n`;
};

const claudeMd = S => `# ${S.brand} (${S.repo}) — 국제학교 × 과목 과외 사이트

- 도메인: ${S.domain} (CNAME). 정적 사이트(GitHub Pages 등), 빌드 없음(.nojekyll).
- **이 폴더의 거의 모든 파일은 생성기 출력물이다**(생성기 폴더의 sites.js 설정 · run.js 실행). 손으로 고치면 재생성 때 덮어써진다. 고칠 게 있으면 생성기를 고치고 \`ONLY=${S.repo}\` 로 재생성.
- 새 글은 \`data/posts/{blog|admissions}/{slug}.json\` 에만 쓴다 — { slug, date, cat, title, desc, keywords, body(HTML) }. 그다음 \`새글.js ${S.repo}\` 를 돌리면 글 페이지·목록·홈·RSS·sitemap-main 이 다시 그려진다(1~2초). blog/·admissions/ 의 HTML 을 손으로 쓰지 않는다.
- 구조: 홈 / regions.html(나라·지역별) / pages/국내국제학교찾기.html·해외국제학교찾기.html / pages/{검색이름}-과외.html(학교 허브) / pages/{검색이름}-{과목}-과외.html / pages/{지역}-국제학교-과외.html / pages/{과목}과외-전체.html / teachers.html + t/{id}.html / curriculum/ (커리큘럼 메뉴) / blog.html / admissions.html / contact.html
- 학교 이름 규칙: 제목·URL 은 검색 이름(sn, 예 채드윅송도), 본문 첫 문장에 한글·영문 이름. 학교 목록은 생성기 데이터/intl-schools-data.js. **발행 뒤 제목·주소를 바꾸지 않는다.**
- 상담: 폼 → Apps Script(run.js 의 HUB, \`sheet=${S.sheetTab}\`) · 채널톡(sites.js channelKey, 비어 있으면 버튼 없음) · 카카오 오픈채팅(kakao) · 전화(sites.js TEL).
- 사이트맵: sitemap.xml(index) → sitemap-main / sitemap-kr(국내 학교) / sitemap-abroad(해외 학교) / sitemap-teachers. IndexNow 키 파일 \`${S.indexnowKey}.txt\`.
- CSS/JS 를 고치면 \`?v=\` 올리기(생성기 build.js head() 의 style.css?v=).
`;

/* ---------- 사이트 하나 생성 ---------- */
/* 데일리 글 데이터: <저장소>/data/posts/{blog|admissions}/{slug}.json  — { slug, date, cat, title, desc, keywords?, body(HTML) }
   데일리 작업이 이 JSON 만 쓰고, 페이지는 여기서 사이트 디자인으로 그린다(디자인을 바꿔도 글이 같이 바뀐다). 기본 글(posts.js)도 함께. */
function loadPosts(dir, kind, seeds) {
  const m = new Map(seeds.map(p => [p.slug, p]));
  const d = path.join(dir, "data/posts", kind);
  if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) {
    if (!f.endsWith(".json")) continue;
    try {
      const p = JSON.parse(fs.readFileSync(path.join(d, f), "utf8").replace(/^﻿/, ""));
      if (p.slug && p.title && p.body && p.date && p.desc) m.set(p.slug, p); else console.log("  ⚠ 글 데이터에 빠진 칸(slug·date·title·desc·body):", kind + "/" + f);
    } catch (e) { console.log("  ⚠ 글 데이터 JSON 오류:", kind + "/" + f, e.message); }
  }
  return [...m.values()].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

function buildSite(S) {
  const dir = path.join(OUT_ROOT, SAMPLE ? '_sample' : '', S.repo);
  const { W, made, changed } = makeWriter();
  const D = dataFor(S), regionOf = D.regionOf, sp = SPEC.PROFILES[S.profile || 'intl'];
  const BUCKETS = ['main', 'kr', 'abroad', 'teachers'];
  const t0 = Date.now();
  const urls = { main: [], kr: [], abroad: [], teachers: [] };
  const add = (bucket, p) => urls[bucket].push(p);

  const full = !POSTS_ONLY;      // false 면 글 관련 파일만 쓴다 (주소 목록은 사이트맵용으로 그대로 모은다)
  const blog = loadPosts(dir, 'blog', B.BLOG), adm = loadPosts(dir, 'admissions', B.ADMISSIONS);

  W(path.join(dir, 'index.html'), B.indexPage(S, D, blog)); add('main', 'index.html');
  full && W(path.join(dir, 'regions.html'), B.regionsIndexPage(S, D)); add('main', 'regions.html');
  for (const lv of D.levels) { full && W(path.join(dir, B.FINDER[lv][1]), B.schoolFinderPage(S, D, lv)); add('main', B.FINDER[lv][1]); }
  for (const sub of D.SUBJECTS_ALL) { full && W(path.join(dir, B.subjIndexFile(sub)), B.subjectIndexPage(S, D, sub)); add('main', B.subjIndexFile(sub)); }
  for (const r of D.regions) { full && W(path.join(dir, B.regionFile(r)), B.regionPage(S, D, r)); add('main', B.regionFile(r)); }
  if (full) for (const s of D.schools) {
    const r = regionOf.get(s.regionKey);
    const b = s.t === '국내' ? 'kr' : 'abroad';
    W(path.join(dir, B.hubFile(s)), B.hubPage(S, D, s, r)); add(b, B.hubFile(s));
    for (const sub of s.subjects) { W(path.join(dir, B.subFile(s, sub)), B.subjectPage(S, D, s, sub, r)); add(b, B.subFile(s, sub)); }
  }
  full && W(path.join(dir, 'teachers.html'), B.teachersPage(S, D)); add('main', 'teachers.html');
  if (full) for (const t of D.teachers) { W(path.join(dir, `t/${t.i}.html`), B.teacherPage(S, D, t)); add('teachers', `t/${t.i}.html`); }
  /* 커리큘럼 메뉴 */
  full && W(path.join(dir, `${sp.dir}/index.html`), B.specIndexPage(S)); add('main', `${sp.dir}/index.html`);
  for (const L of sp.pages) { full && W(path.join(dir, `${sp.dir}/${L.key}.html`), B.specPage(S, L)); add('main', `${sp.dir}/${L.key}.html`); }
  W(path.join(dir, 'blog.html'), B.listPage(S, 'blog', blog)); add('main', 'blog.html');
  for (const p of blog) { W(path.join(dir, `blog/${p.slug}.html`), B.postPage(S, 'blog', p, blog)); add('main', `blog/${p.slug}.html`); }
  W(path.join(dir, 'admissions.html'), B.listPage(S, 'admissions', adm)); add('main', 'admissions.html');
  for (const p of adm) { W(path.join(dir, `admissions/${p.slug}.html`), B.postPage(S, 'admissions', p, adm)); add('main', `admissions/${p.slug}.html`); }
  full && W(path.join(dir, 'contact.html'), B.contactPage(S)); add('main', 'contact.html');
  full && W(path.join(dir, '404.html'), B.notFoundPage(S));

  /* 공용 파일 */
  W(path.join(dir, 'style.css'), buildCss(S));
  W(path.join(dir, 'app.js'), appJs);
  W(path.join(dir, 'form.js'), formJs(S));
  W(path.join(dir, 'quick.js'), quickJs(S, D));
  W(path.join(dir, 'analytics.js'), analyticsJs(S));
  if (S.channelKey) W(path.join(dir, 'channeltalk.js'), channelJs(S));
  W(path.join(dir, 'favicon.svg'), faviconSvg(S));
  W(path.join(dir, 'CNAME'), S.domain + '\n');
  W(path.join(dir, '.nojekyll'), '');
  W(path.join(dir, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /data/\n\nSitemap: ${S.siteUrl}/sitemap.xml\n` + BUCKETS.map(k => `Sitemap: ${S.siteUrl}/sitemap-${k}.xml\n`).join(''));
  W(path.join(dir, `${S.indexnowKey}.txt`), S.indexnowKey);
  W(path.join(dir, 'llms.txt'), `# ${S.brand}\n\n> ${S.tagline}\n\n- 서비스: ${PROFILES[S.profile].desc}\n- 상담 전화: ${TEL}\n- 국내 국제학교: ${S.siteUrl}/pages/국내국제학교찾기.html\n- 해외 국제학교: ${S.siteUrl}/pages/해외국제학교찾기.html\n- 커리큘럼(IB·AP·IGCSE·A-Level·SAT·입학): ${S.siteUrl}/curriculum/index.html\n- 선생님: ${S.siteUrl}/teachers.html\n- 사이트맵: ${S.siteUrl}/sitemap.xml\n`);
  W(path.join(dir, 'CLAUDE.md'), claudeMd(S));
  W(path.join(dir, '.gitignore'), 'Thumbs.db\n.DS_Store\n*.log\n');
  W(path.join(dir, '.gitattributes'), '* text=auto eol=lf\n');   // 생성기는 LF 로 쓴다 — autocrlf 경고 5만 줄 방지
  /* 예전 사이트 주소 → 새 페이지로 넘기기(sites.js redirects). 검색에 잡혀 있던 옛 주소가 404 가 되지 않게 */
  for (const [from, to] of Object.entries(S.redirects || {})) {
    const up = '../'.repeat(from.split('/').length - 1), url = `${S.siteUrl}/${B.encPath(to)}`;
    W(path.join(dir, from), `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${S.brand}</title><link rel="canonical" href="${url}"><meta http-equiv="refresh" content="0; url=${up}${to}"><meta name="robots" content="noindex"></head><body><a href="${up}${to}">${S.brand} — 새 주소로 이동합니다</a><script>location.replace(${JSON.stringify(up + to)}+location.search)</script></body></html>\n`);
  }
  /* 사이트별 그대로 넣을 파일(네이버·구글 소유확인 HTML 등): 데이터/extra/<repo>/ 아래를 같은 경로로 복사 */
  const extra = path.join(__dirname, '데이터/extra', S.repo);
  if (fs.existsSync(extra)) for (const f of fs.readdirSync(extra, { recursive: true })) {
    const p = path.join(extra, f);
    if (fs.statSync(p).isFile()) W(path.join(dir, f), fs.readFileSync(p));
  }

  /* RSS — 수업 이야기 + 입시정보, 최신 40편 */
  const feed = [...blog.map(p => ['blog', p]), ...adm.map(p => ['admissions', p])].sort((a, b) => b[1].date.localeCompare(a[1].date)).slice(0, 40);
  W(path.join(dir, 'rss.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${S.brand} 수업 이야기 · 유학·입시정보</title><link>${S.siteUrl}/blog.html</link><description>${S.tagline}</description><language>ko</language>\n` +
    feed.map(([k, p]) => `<item><title><![CDATA[${p.title}]]></title><link>${S.siteUrl}/${k}/${encodeURIComponent(p.slug)}.html</link><guid>${S.siteUrl}/${k}/${encodeURIComponent(p.slug)}.html</guid><pubDate>${new Date(p.date + 'T09:00:00+09:00').toUTCString()}</pubDate><description><![CDATA[${p.desc}]]></description></item>`).join('\n') + '\n</channel></rss>\n');

  /* 사이트맵 — lastmod: git 커밋 날짜(있으면) / 이번에 바뀐 파일·새 파일은 오늘 */
  const gd = gitDates(dir);
  const lm = p => changed.has(path.resolve(path.join(dir, p))) ? B.TODAY : (gd.get(p) || B.TODAY);
  const xml = list => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    list.map(p => `<url><loc>${S.siteUrl}/${p === 'index.html' ? '' : B.encPath(p)}</loc><lastmod>${lm(p)}</lastmod></url>`).join('\n') + '\n</urlset>\n';
  for (const k of (full ? BUCKETS : ['main'])) W(path.join(dir, `sitemap-${k}.xml`), xml(urls[k]));
  full && W(path.join(dir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    BUCKETS.map(k => `<sitemap><loc>${S.siteUrl}/sitemap-${k}.xml</loc><lastmod>${B.TODAY}</lastmod></sitemap>`).join('\n') + '\n</sitemapindex>\n');

  if (!full) {   // 데일리용: 바뀐 파일 목록을 git add 하기 좋게 출력
    const rel = [...changed].map(p => path.relative(dir, p).replace(/\\/g, '/'));
    console.log(`${S.repo} 글 반영: 수업 이야기 ${blog.length}편 · 입시정보 ${adm.length}편 · 바뀐 파일 ${rel.length}개`);
    console.log('바뀐 파일: ' + rel.join(' '));
    return;
  }

  /* 생성기 소유 폴더 정리: pages/ · t/ 에서 이번에 안 만든 파일 삭제 */
  let removed = 0;
  for (const sub of ['pages', 't']) {
    const d = path.join(dir, sub);
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) { const p = path.resolve(d, f); if (!made.has(p)) { fs.unlinkSync(p); removed++; } }
  }
  const total = urls.main.length + urls.kr.length + urls.abroad.length + urls.teachers.length;
  console.log(`${S.repo.padEnd(12)} ${S.brand.padEnd(6)} 페이지 ${total.toLocaleString()} (학교 국내 ${urls.kr.length.toLocaleString()} · 해외 ${urls.abroad.length.toLocaleString()} · 선생님 ${urls.teachers.length} · 기타 ${urls.main.length}) · 바뀐 파일 ${changed.size.toLocaleString()} · 지운 파일 ${removed} · ${((Date.now() - t0) / 1000).toFixed(0)}초 → ${dir}`);
}

const targets = SITES.filter(S => !ONLY || ONLY.includes(S.repo));
for (const S of targets) { const D = dataFor(S); console.log(`[${S.profile}] 학교 ${D.schools.length.toLocaleString()} · 지역 ${D.regions.length} · 선생님 ${D.teachers.length}${SAMPLE ? ' (SAMPLE)' : ''}`); buildSite(S); }
