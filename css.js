/* 사이트별 style.css — 2026-10-19 3차 개편(사용자: "찍어내기라 식상하다, 목록이 지저분하다").
   - 색은 전부 토큰(--bg/--surface/--ink …)으로만 쓴다 → 같은 CSS 로 밝은 사이트·어두운 사이트(티처스풍)를 모두 만든다.
   - 학교 목록 = 같은 크기 칸 격자(.sgrid, 티처스 학교찾기) + "시군구 | 학교들" 줄(.city, 와와 센터 카드처럼 줄 맞춤)
   - 지역 목록 = 시도 상자 안 "강남구 · 22개교" 칸(.rgrid, 티칭코칭 학교찾기)
   - 한글 줄바꿈: word-break:keep-all (단어 중간에서 안 끊김) + 제목 text-wrap:balance
   - 간편선택 팝업(.q-*) 스타일도 여기 있다 — 빠지면 팝업이 페이지 맨 아래에 펼쳐진 채로 보인다(2026-10-18 실제 발생). */
const { FONTS } = require('./sites');

const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',');

function buildCss(S) {
  const t = S.theme;
  const dark = t.mode === 'dark';
  const head = FONTS[t.head].stack, body = FONTS[t.font].stack, hw = FONTS[t.head].weight;
  const gf = [...new Set([t.head, t.font].map(k => FONTS[k].link).filter(Boolean))];
  const fontImport = gf.length ? `@import url('https://fonts.googleapis.com/css2?${gf.map(f => 'family=' + f).join('&')}&display=swap');\n` : '';
  const pretendard = (t.head === 'pretendard' || t.font === 'pretendard') ? `@import url('https://fastly.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css');\n` : '';
  const P = rgb(t.primary), A = rgb(t.accent), I = rgb(t.ink), B = rgb(t.bg);
  const SH = dark ? '0,0,0' : I;                 // 그림자 색
  const pill = t.btn === 'pill' ? '999px' : t.radius;

  /* ---------- 히어로 변형 (사이트마다 구조가 다르다) ---------- */
  const heroCss = {
    /* ===== 2026-10-24 추가 6곳 — 기존 5곳과 겹치지 않는 모양 ===== */
    /* magazine — 잡지: 왼쪽 큰 제목, 오른쪽 번호 붙은 약속 3개, 가는 가로선 */
    magazine: `.hero{background:var(--bg);border-bottom:2px solid var(--ink)}
.hero .wrap{display:grid;grid-template-columns:1.05fr .95fr;gap:64px;align-items:start;padding:clamp(60px,8vw,100px) 0 clamp(56px,7vw,88px)}
.hero h1{font-size:clamp(2.4rem,5vw,3.9rem);letter-spacing:-.04em}
.hero-list{list-style:none;margin:0;padding:0;border-top:2px solid var(--ink);counter-reset:n}
.hero-list li{display:grid;grid-template-columns:52px 1fr;gap:12px;padding:22px 0;border-bottom:1px solid var(--line)}
.hero-list li::before{counter-increment:n;content:"0" counter(n);font-family:var(--head);font-size:1.4rem;color:var(--accent);line-height:1}
.hero-list b{grid-column:2;display:block;font-size:1.08rem;margin-bottom:4px}
.hero-list span{grid-column:2;font-size:.93rem;color:var(--ink-soft)}
.hero-side{display:none}`,
    /* poster — 포스터: 거대한 제목, 형광 블록, 왼쪽 정렬 */
    poster: `.hero{background:var(--bg);background-image:linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px);background-size:48px 48px}
.hero .wrap{padding:clamp(70px,9vw,120px) 0 clamp(56px,7vw,90px)}
.hero .in{max-width:1000px}
.hero h1{font-size:clamp(3rem,8vw,6.4rem);line-height:1.02;letter-spacing:-.02em;font-weight:400}
.hero h1 em{background:var(--primary);color:var(--on-primary);padding:0 .15em;display:inline-block}
.hero .eyebrow{color:var(--accent)}
.hero .lead{font-size:1.2rem;max-width:600px;color:var(--ink)}
.hero .btn-primary{border-radius:0}
.hero .btn-ghost{border-color:rgba(255,255,255,.4);color:#fff;border-radius:0}
.hero-facts{border-top-color:rgba(255,255,255,.2)}
.hero-side{display:none}`,
    /* stats — 숫자: 가운데 제목 아래 커다란 숫자 넷 */
    stats: `.hero{background:radial-gradient(900px 500px at 50% -10%,rgba(${P},.16),transparent 60%),var(--bg);text-align:center}
.hero .wrap{padding:clamp(70px,9vw,120px) 0 clamp(56px,7vw,90px);max-width:900px}
.hero h1{font-size:clamp(2.4rem,5.2vw,4rem)}
.hero .lead,.hero .hero-cta{margin-left:auto;margin-right:auto;justify-content:center}
.hero-nums{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:48px}
.hero-nums div{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:26px 10px;box-shadow:0 30px 50px -40px rgba(${I},.3)}
.hero-nums b{display:block;font-family:var(--head);font-size:clamp(2rem,4.6vw,3.2rem);color:var(--primary);line-height:1.05;letter-spacing:-.04em}
.hero-nums span{font-size:.86rem;color:var(--ink-soft)}
.hero-side,.hero-facts{display:none}`,
    /* tilesHero — 상점: 오른쪽에 과목 10개를 상품처럼 진열 */
    tilesHero: `.hero{background:linear-gradient(180deg,var(--surface2),var(--bg) 80%)}
.hero .wrap{display:grid;grid-template-columns:.95fr 1.05fr;gap:48px;align-items:center;padding:clamp(60px,8vw,100px) 0 clamp(52px,7vw,84px)}
.hero h1{font-size:clamp(2.2rem,4.6vw,3.5rem)}
.hero-tiles{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.hero-tiles a{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:16px 6px 12px;text-align:center;color:var(--ink);font-weight:700;font-size:.86rem;box-shadow:0 18px 30px -24px rgba(${I},.35);transition:transform .15s,border-color .15s}
.hero-tiles a b{display:block;font-size:1.5rem;font-weight:400;margin-bottom:6px}
.hero-tiles a:hover{transform:translateY(-3px);border-color:var(--primary);text-decoration:none}
.hero-tiles .all{grid-column:1/-1;background:var(--primary);color:var(--on-primary);border-color:var(--primary);padding:13px}
.hero-side{display:none}`,
    /* band — 띠: 위쪽 검은 띠에 제목, 아래로 숫자 카드가 걸쳐 내려옴 */
    band: `.hero{background:var(--foot);color:#fff;border-bottom:0;overflow:visible}
.hero .wrap{padding:clamp(64px,8vw,100px) 0 110px;max-width:900px;text-align:center}
.hero h1{font-size:clamp(2.3rem,5vw,3.8rem);color:#fff}
.hero h1 em{color:var(--accent)}
.hero .eyebrow{color:var(--accent)}
.hero .lead{color:rgba(255,255,255,.8);margin:0 auto}
.hero .hero-cta{justify-content:center}
.hero .btn-primary{background:var(--accent);color:#111}
.hero .btn-ghost{color:#fff;border-color:rgba(255,255,255,.45)}
.hero-facts{position:relative;z-index:2;margin:40px auto -170px;max-width:900px;background:var(--surface);color:var(--ink);border:1px solid var(--line);border-top:3px solid var(--accent);padding:26px 10px 20px;gap:0;justify-content:space-around;box-shadow:0 40px 70px -40px rgba(0,0,0,.6)}
.hero-facts b{color:var(--ink);font-size:2rem}
.hero-facts span{color:var(--ink-soft)}
.hero + section{padding-top:150px}
.hero-side{display:none}`,
    /* regions — 지역: 오른쪽에 시·도 17개 바로가기 */
    regions: `.hero{background:var(--bg);background-image:radial-gradient(700px 400px at 100% 0%,rgba(${A},.35),transparent 60%)}
.hero .wrap{display:grid;grid-template-columns:1fr .9fr;gap:56px;align-items:center;padding:clamp(64px,8vw,104px) 0 clamp(56px,7vw,88px)}
.hero h1{font-size:clamp(2.3rem,4.8vw,3.6rem)}
.hero-regions{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:26px 26px 22px;box-shadow:0 30px 60px -40px rgba(${I},.4)}
.hero-regions h3{margin:0 0 4px;font-size:1.1rem}
.hero-regions p{font-size:.88rem;color:var(--ink-soft);margin:0 0 14px}
.hero-regions .sido{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.hero-regions .sido a{display:block;text-align:center;padding:9px 4px;border:1px solid var(--line);border-radius:calc(var(--r) * .6 + 2px);color:var(--ink);font-size:.9rem;font-weight:600}
.hero-regions .sido a:hover{background:var(--primary);color:var(--on-primary);border-color:var(--primary);text-decoration:none}
.hero-regions .btn{width:100%;justify-content:center;margin-top:14px}
.hero-side{display:none}`,
    /* split — 종이빛 클래식: 왼쪽 큰 명조 제목, 오른쪽 "어떤 도움" 카드, 금빛 원광 */
    split: `.hero{background:radial-gradient(900px 480px at 90% 10%,rgba(${A},.20),transparent 60%),radial-gradient(700px 420px at 5% 95%,rgba(${P},.08),transparent 60%),var(--bg)}
.hero .wrap{display:grid;grid-template-columns:1.15fr .85fr;gap:56px;align-items:center;padding:clamp(72px,9vw,120px) 0 clamp(60px,7vw,96px)}
.hero h1{font-size:clamp(2.3rem,4.6vw,3.6rem)}
.hero-side{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:30px;box-shadow:0 40px 80px -50px rgba(${SH},.45)}
.hero-side::before{content:"";display:block;width:44px;height:2px;background:var(--accent);margin-bottom:18px}`,
    /* search — 미니멀: 가운데 큰 제목 + 학교 검색창 하나 */
    search: `.hero{background:linear-gradient(180deg,var(--surface2),var(--bg) 75%);text-align:center}
.hero .wrap{padding:clamp(80px,10vw,130px) 0 clamp(64px,8vw,100px);max-width:860px}
.hero h1{font-size:clamp(2.4rem,5.4vw,4rem);letter-spacing:-.04em}
.hero .lead{margin:0 auto}
.hero .hero-cta,.hero-facts{justify-content:center}
.hero-search{display:flex;max-width:620px;margin:34px auto 0;background:var(--surface);border:1.5px solid var(--ink);border-radius:999px;padding:6px;box-shadow:0 30px 60px -36px rgba(${SH},.45)}
.hero-search input{flex:1;border:0;background:transparent;padding:12px 20px;font-size:1.05rem;font-family:inherit;color:var(--ink);min-width:0}
.hero-search input:focus{outline:none}
.hero-search button{border:0;background:var(--primary);color:var(--on-primary);font-weight:700;font-family:inherit;font-size:1rem;padding:0 26px;border-radius:999px;cursor:pointer;white-space:nowrap}
.hero-hint{margin-top:14px;font-size:.88rem;color:var(--ink-soft)}
.hero-hint a{color:var(--ink);text-decoration:underline;text-underline-offset:3px;margin:0 4px}
.hero-facts{border-top:0;margin-top:46px;gap:0;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:6px 0}
.hero-facts>div{flex:1;padding:14px 10px;border-right:1px solid var(--line)}
.hero-facts>div:last-child{border-right:0}`,
    /* teachers — 어두운 보라: 왼쪽 제목, 오른쪽 선생님 카드 3장 겹침 */
    teachers: `.hero{background:var(--bg);background-image:radial-gradient(900px 600px at 10% 0%,rgba(${P},.35),transparent 60%),radial-gradient(800px 600px at 100% 100%,rgba(${A},.22),transparent 60%)}
.hero .wrap{display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center;padding:clamp(76px,9vw,124px) 0 clamp(64px,8vw,100px)}
.hero h1{font-size:clamp(2.3rem,4.8vw,3.7rem)}
.hero-stack{display:grid;gap:12px}
.hero-stack .t-card{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12);backdrop-filter:blur(10px)}
.hero-stack .t-card:nth-child(2){margin-left:36px}
.hero-stack .t-card:nth-child(3){margin-left:12px}
.hero-stack .more{font-size:.88rem;color:var(--ink-soft);text-align:right}`,
    /* form — 티처스풍 네이비·금색: 왼쪽 명조 2줄(둘째 줄 금색), 오른쪽 금테 빠른 신청 폼 */
    form: `.hero{background:var(--bg);background-image:radial-gradient(1000px 600px at 85% 0%,rgba(${P},.16),transparent 60%),linear-gradient(180deg,rgba(255,255,255,.02),transparent)}
.hero .wrap{display:grid;grid-template-columns:1.1fr .9fr;gap:64px;align-items:center;padding:clamp(80px,10vw,130px) 0 clamp(70px,8vw,110px)}
.hero h1{font-size:clamp(2.6rem,5.6vw,4.4rem);line-height:1.18}
.hero .quote{font-family:var(--head);font-size:1.25rem;color:var(--hl);margin:0 0 10px}
.hero-form{background:var(--surface);border:1.5px solid var(--primary);border-radius:var(--r);padding:30px;box-shadow:0 0 0 6px rgba(${P},.08),0 40px 80px -40px rgba(0,0,0,.8)}
.hero-form h3{margin:0 0 18px;font-size:1.15rem}
.hero-form .field{margin-bottom:12px}
.hero-form .btn{width:100%;justify-content:center;margin-top:6px}
.hero-form .note{font-size:.8rem;color:var(--ink-soft);text-align:center;margin:12px 0 0}`,
    /* soft — 따뜻한 밝은 톤: 둥근 원 장식, 둥근 카드 */
    soft: `.hero{background:var(--surface2);overflow:hidden}
.hero::before,.hero::after{content:"";position:absolute;border-radius:50%;z-index:0}
.hero::before{width:520px;height:520px;right:-140px;top:-180px;background:rgba(${A},.22)}
.hero::after{width:360px;height:360px;left:-120px;bottom:-200px;background:rgba(${P},.12)}
.hero .wrap{position:relative;z-index:1;display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:center;padding:clamp(72px,9vw,120px) 0 clamp(60px,7vw,96px)}
.hero h1{font-size:clamp(2.3rem,4.8vw,3.6rem)}
.hero-side{background:var(--surface);border-radius:28px;padding:30px;box-shadow:0 40px 80px -50px rgba(${P},.55)}`
  }[t.hero];

  const nav = t.nav === 'center'
    ? `.nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:16px 0 12px}
.brand{grid-column:2;justify-self:center;font-size:1.5rem}
.nav-cta{grid-column:3;justify-self:end}
.nav-links{grid-column:1/-1;grid-row:2;justify-content:center;margin-top:10px;border-top:1px solid var(--line);padding-top:8px}`
    : t.nav === 'stacked'
    ? `.nav{display:grid;grid-template-columns:auto auto;align-items:center;row-gap:6px;padding:14px 0 10px}
.brand{grid-column:1;grid-row:1}
.nav-cta{grid-column:2;grid-row:1;justify-self:end}
.nav-links{grid-column:1/-1;grid-row:2;justify-content:center;border-top:1px solid var(--line);padding-top:6px}`
    : `.nav{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0}`;

  return `${fontImport}${pretendard}
/* ${S.brand} — 전국 학교별 과외 사이트 (자동 생성: 생성기 폴더 — 손으로 고치지 말 것) */
:root{--bg:${t.bg};--surface:${t.surface};--surface2:${t.surface2};--ink:${t.ink};--ink-soft:rgba(${I},.64);--line:rgba(${I},${dark ? '.12' : '.1'});--primary:${t.primary};--on-primary:${t.onPrimary};--accent:${t.accent};--hl:${t.hl};--foot:${t.foot};--r:${t.radius};--pill:${pill};--head:${head};--body:${body};--hw:${hw}${dark ? ';color-scheme:dark' : ''}}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:var(--body);color:var(--ink);background:var(--bg);line-height:1.8;-webkit-text-size-adjust:100%;word-break:keep-all;overflow-wrap:break-word}
img,svg{max-width:100%}
a{color:var(--primary);text-decoration:none}
a:hover{text-decoration:underline}
h1,h2,h3,h4,.brand,.stat b,.hero-facts b{font-family:var(--head);font-weight:var(--hw);line-height:1.28;letter-spacing:-.025em;text-wrap:balance}
p,li{text-wrap:pretty}
h1{font-size:clamp(1.9rem,4.2vw,3rem);margin:0 0 16px}
h2{font-size:clamp(1.45rem,2.6vw,2rem);margin:0 0 14px}
h3{font-size:1.12rem;margin:26px 0 8px}
p{margin:0 0 14px}
em{font-style:normal}
.wrap{width:min(1160px,92vw);margin:0 auto}
section{padding:clamp(60px,7vw,100px) 0}
.lead{font-size:1.08rem;color:var(--ink-soft);max-width:660px}
.center{text-align:center}
.center .lead,.lead.center{margin-left:auto;margin-right:auto}
.muted{color:var(--ink-soft)}
.small{font-size:.88rem}
.soft{background:var(--surface2)}
.eyebrow{display:inline-block;font-size:.76rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--hl);margin-bottom:14px}
.sec-head{margin-bottom:40px}
.sec-head h2{margin-bottom:10px}
.sec-head.row{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap}
.sec-head.row .lead{margin:0}
.more-link{font-weight:700;color:var(--ink);border-bottom:1px solid currentColor;padding-bottom:2px}
.more-link:hover{color:var(--primary);text-decoration:none}

/* 맨 위 안내띠 (form 변형) */
.topbar{background:var(--primary);color:var(--on-primary);text-align:center;font-size:.84rem;font-weight:700;padding:8px 12px;letter-spacing:.01em}

/* 헤더 */
header{position:sticky;top:0;z-index:50;background:rgba(${B},.88);backdrop-filter:saturate(1.4) blur(12px);border-bottom:1px solid var(--line)}
${nav}
.brand{display:flex;align-items:center;gap:10px;font-size:1.32rem;color:var(--ink);letter-spacing:-.03em}
.brand:hover{text-decoration:none}
.brand small{font-family:var(--body);font-size:.72rem;font-weight:600;color:var(--ink-soft);letter-spacing:.08em;text-transform:uppercase}
.nav-links{display:flex;gap:2px;flex-wrap:wrap;margin:0;padding:0;list-style:none}
.nav-links>li{position:relative}
.nav-links a{display:block;padding:9px 14px;border-radius:var(--pill);font-size:.95rem;font-weight:600;color:var(--ink)}
.nav-links a:hover,.nav-links a.active{color:var(--hl);text-decoration:none;background:rgba(${P},.08)}
.nav-links .sub{display:none;position:absolute;top:100%;left:0;min-width:210px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:8px;box-shadow:0 24px 50px -24px rgba(${SH},.5);z-index:60}
.nav-links .sub a{padding:9px 12px;border-radius:8px;font-size:.9rem;white-space:nowrap;font-weight:500}
.nav-links>li:hover .sub,.nav-links>li:focus-within .sub{display:block}
.nav-cta{display:flex;gap:8px;align-items:center}
.menu-btn{display:none;background:none;border:1px solid var(--line);border-radius:10px;padding:7px 11px;font-size:1.05rem;cursor:pointer;color:var(--ink)}
.m-nav{display:none;border-top:1px solid var(--line);padding:10px 0 14px}
.m-nav.open{display:block}
.m-nav a{display:block;padding:10px 6px;color:var(--ink);font-weight:600;border-bottom:1px solid var(--line)}
.m-nav .m-sub a{padding-left:22px;font-weight:500;color:var(--ink-soft);font-size:.93rem}

/* 버튼 */
.btn{display:inline-flex;align-items:center;gap:8px;padding:14px 26px;border-radius:var(--pill);font-weight:700;font-size:.97rem;border:1px solid transparent;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease,background .15s;font-family:inherit;line-height:1.2}
.btn:hover{text-decoration:none;transform:translateY(-1px)}
.btn-primary{background:var(--primary);color:var(--on-primary);box-shadow:0 16px 30px -18px rgba(${P},.9)}
.btn-ghost{background:transparent;color:var(--ink);border-color:rgba(${I},.25)}
.btn-ghost:hover{border-color:var(--primary);color:var(--primary)}
.btn-sm{padding:9px 16px;font-size:.88rem}

/* 히어로 공통 */
.hero{position:relative;overflow:hidden;border-bottom:1px solid var(--line)}
.hero h1 em{color:var(--hl)}
.hero .lead{font-size:1.12rem;max-width:560px}
.hero-cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}
.hero-facts{display:flex;gap:30px;flex-wrap:wrap;margin-top:38px;padding-top:24px;border-top:1px solid var(--line)}
.hero-facts b{display:block;font-size:1.75rem;color:var(--hl);line-height:1.1}
.hero-facts span{font-size:.84rem;color:var(--ink-soft)}
.hero-side h3{margin:0 0 6px;font-size:1.15rem}
.hero-side>p{font-size:.9rem;margin:0 0 16px;color:var(--ink-soft)}
.chip-row{display:flex;flex-wrap:wrap;gap:6px}
.chip-row a{display:inline-block;font-size:.85rem;font-weight:600;padding:7px 12px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);color:var(--ink)}
.chip-row a:hover{background:var(--primary);color:var(--on-primary);text-decoration:none}
.hero-side .btn{width:100%;justify-content:center;margin-top:18px}
${heroCss}

/* 페이지 머리 */
.page-hero{background:linear-gradient(180deg,var(--surface2),var(--bg));padding:clamp(44px,5vw,70px) 0 clamp(34px,4vw,52px);border-bottom:1px solid var(--line)}
.page-hero h1{font-size:clamp(1.8rem,3.8vw,2.7rem)}
.crumb{font-size:.83rem;color:var(--ink-soft);margin-bottom:12px}
.crumb a{color:var(--ink-soft)}

/* 카드·그리드 */
.grid{display:grid;gap:18px}
.g2{grid-template-columns:repeat(2,1fr)}
.g3{grid-template-columns:repeat(3,1fr)}
.g4{grid-template-columns:repeat(4,1fr)}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:28px;transition:box-shadow .2s,border-color .2s}
.card:hover{border-color:rgba(${P},.35);box-shadow:0 30px 50px -36px rgba(${SH},.45)}
.card h3{margin:0 0 8px;font-size:1.1rem}
.card p{margin:0;color:var(--ink-soft);font-size:.95rem}
.card .ico{font-size:1.4rem;margin-bottom:16px;display:grid;place-items:center;width:50px;height:50px;border-radius:14px;background:rgba(${P},.1)}
.card .no{display:block;font-family:var(--head);font-size:2rem;color:var(--hl);line-height:1;margin-bottom:14px}

/* 과목 — 타일형 */
.tiles{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.tile{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:24px 12px 20px;text-align:center;color:var(--ink);font-weight:700;font-size:.97rem;transition:transform .2s,box-shadow .2s,border-color .2s}
.tile b{display:grid;place-items:center;width:54px;height:54px;margin:0 auto 12px;border-radius:50%;background:rgba(${P},.1);font-size:1.45rem;font-weight:400}
.tile:hover{text-decoration:none;transform:translateY(-3px);border-color:rgba(${P},.4);box-shadow:0 30px 50px -36px rgba(${SH},.5)}
/* 과목 — 목록형(번호·설명·화살표) */
.slist{display:grid;grid-template-columns:repeat(2,1fr);border-top:1px solid var(--line)}
.slist a{display:grid;grid-template-columns:56px 1fr auto;align-items:center;gap:8px;padding:22px 8px;border-bottom:1px solid var(--line);color:var(--ink)}
.slist a:nth-child(odd){border-right:1px solid var(--line);padding-right:24px}
.slist a:nth-child(even){padding-left:24px}
.slist .no{font-family:var(--head);font-size:1.1rem;color:var(--hl)}
.slist b{font-family:var(--head);font-size:1.2rem;font-weight:var(--hw)}
.slist em{display:block;font-size:.85rem;color:var(--ink-soft);margin-top:2px}
.slist i{font-style:normal;color:var(--ink-soft);transition:transform .2s}
.slist a:hover{text-decoration:none;background:rgba(${P},.05)}
.slist a:hover i{transform:translateX(4px);color:var(--hl)}

/* 진행 단계 */
.steps{display:grid;grid-template-columns:repeat(5,1fr);gap:18px;counter-reset:s;position:relative}
.steps::before{content:"";position:absolute;left:4%;right:4%;top:23px;height:1px;background:var(--line)}
.steps div{position:relative;padding:58px 6px 0}
.steps div::before{counter-increment:s;content:counter(s);position:absolute;top:0;left:0;width:46px;height:46px;border-radius:50%;background:var(--bg);border:1px solid rgba(${P},.45);color:var(--hl);display:grid;place-items:center;font-weight:800;font-family:var(--head)}
.steps b{display:block;margin-bottom:4px;font-size:1.04rem}
.steps span{font-size:.9rem;color:var(--ink-soft)}

/* 숫자 띠 */
.stat-strip{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--line);border-radius:var(--r);background:var(--surface)}
.stat{padding:30px 22px;border-right:1px solid var(--line);text-align:center}
.stat:last-child{border-right:0}
.stat b{display:block;font-size:clamp(1.8rem,3.4vw,2.6rem);color:var(--hl);line-height:1.1;margin-bottom:6px}
.stat span{font-size:.88rem;color:var(--ink-soft)}

/* ===== 학교 목록 (티처스식 격자 + 와와식 줄 맞춤) ===== */
.sido-nav{display:flex;flex-wrap:wrap;gap:6px;margin:18px 0 0}
.sido-nav a{padding:7px 14px;border:1px solid var(--line);border-radius:999px;font-size:.87rem;font-weight:600;background:var(--surface);color:var(--ink)}
.sido-nav a em{color:var(--ink-soft);font-weight:500;margin-left:4px}
.sido-nav a:hover{border-color:var(--primary);color:var(--primary);text-decoration:none}
.sido-block{margin:0 0 54px;scroll-margin-top:90px}
.sido-head{display:flex;align-items:baseline;gap:14px;border-bottom:2px solid var(--ink);padding-bottom:12px;margin-bottom:4px}
.sido-head h2{margin:0;font-size:clamp(1.4rem,2.4vw,1.8rem)}
.sido-head span{color:var(--ink-soft);font-size:.92rem}
.city{display:grid;grid-template-columns:170px 1fr;gap:20px;padding:18px 0;border-bottom:1px solid var(--line)}
.city h3{margin:4px 0 0;font-size:1rem;line-height:1.4}
.city h3 a{color:var(--ink)}
.city h3 a:hover{color:var(--primary)}
.city h3 em{display:block;font-family:var(--body);font-weight:500;font-size:.8rem;color:var(--ink-soft);margin-top:2px}
.sgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:8px}
.sgrid a{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:10px 13px;background:var(--surface);border:1px solid var(--line);border-radius:calc(var(--r) * .6 + 2px);color:var(--ink);font-size:.92rem;line-height:1.3;transition:border-color .15s,background .15s}
.sgrid a b{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sgrid a span{flex:none;font-size:.74rem;color:var(--ink-soft)}
.sgrid a:hover{border-color:var(--primary);background:rgba(${P},.06);text-decoration:none}
.sgrid a:hover span{color:var(--hl)}
.sgrid.wide{grid-template-columns:repeat(auto-fill,minmax(170px,1fr))}
/* 지역 목록 (티칭코칭식 상자 + 칸) */
.region-box{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:22px 24px;margin-bottom:16px}
.region-box h3{margin:0 0 14px;font-size:1.1rem;display:flex;gap:10px;align-items:baseline}
.region-box h3 span{font-family:var(--body);font-size:.84rem;font-weight:500;color:var(--ink-soft)}
.rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.rgrid a{display:flex;justify-content:space-between;align-items:center;gap:6px;padding:11px 14px;border:1px solid var(--line);border-radius:calc(var(--r) * .6 + 2px);background:var(--bg);color:var(--ink);font-size:.93rem}
.rgrid a b{font-weight:600}
.rgrid a span{font-size:.76rem;color:var(--ink-soft);white-space:nowrap}
.rgrid a:hover{border-color:var(--primary);text-decoration:none}
.rgrid a:hover b{color:var(--primary)}
/* 시도 탭 (홈) */
.rtabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px}
.rtabs button{padding:8px 15px;border:1px solid var(--line);background:var(--surface);border-radius:999px;font-size:.88rem;font-weight:600;color:var(--ink);cursor:pointer;font-family:inherit}
.rtabs button[aria-pressed="true"]{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.is-off{display:none!important}

/* 검색 */
.toolbar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:20px}
.search{flex:1;min-width:240px;max-width:560px;padding:14px 22px;border:1px solid rgba(${I},.22);border-radius:999px;font-size:1rem;font-family:inherit;background:var(--surface);color:var(--ink)}
.search:focus{outline:2px solid rgba(${P},.5);outline-offset:1px}
.chips{display:flex;gap:7px;flex-wrap:wrap}
.chip{padding:8px 15px;border:1px solid var(--line);background:var(--surface);border-radius:999px;font-size:.88rem;font-weight:600;color:var(--ink);cursor:pointer;font-family:inherit;transition:all .15s}
.chip[aria-pressed="true"],.chip:hover{background:var(--primary);color:var(--on-primary);border-color:var(--primary);text-decoration:none}
.school-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
.school-item{display:block;padding:14px 16px;border:1px solid var(--line);border-radius:calc(var(--r) * .6 + 2px);background:var(--surface);color:var(--ink);font-size:.95rem;font-weight:600;transition:border-color .15s}
.school-item:hover{border-color:var(--primary);text-decoration:none}
.school-item i{display:block;font-style:normal;font-size:.78rem;color:var(--ink-soft);margin-top:2px;font-weight:400}

/* 본문 글 */
.article{max-width:800px;margin:0 auto;font-size:1.03rem}
.article h2{margin-top:46px;padding-top:6px;font-size:clamp(1.3rem,2.2vw,1.65rem)}
.article ul,.article ol{padding-left:22px;margin:0 0 16px}
.article li{margin-bottom:8px}
.article table{width:100%;border-collapse:collapse;margin:18px 0;font-size:.95rem}
.article th,.article td{border-bottom:1px solid var(--line);padding:12px;text-align:left}
.article th{background:var(--surface2);font-weight:700;border-top:1px solid var(--line)}
.article .sgrid,.article .rgrid{margin:14px 0 6px}
.hl-box{background:var(--surface2);border-left:3px solid var(--accent);padding:18px 22px;border-radius:0 var(--r) var(--r) 0;margin:28px 0}
.kwlist{display:flex;flex-wrap:wrap;gap:7px;margin:14px 0}
.kwlist span{border:1px solid var(--line);border-radius:999px;padding:4px 11px;font-size:.84rem;color:var(--ink-soft)}
.faq-list details{border-bottom:1px solid var(--line);padding:18px 4px}
.faq-list summary{font-weight:700;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:12px;font-size:1.02rem}
.faq-list summary::-webkit-details-marker{display:none}
.faq-list summary::after{content:"+";color:var(--hl);font-size:1.3rem;font-weight:300;flex:none}
.faq-list details[open] summary::after{content:"−"}
.faq-list p{margin:12px 0 0;color:var(--ink-soft)}
.cta-band{background:var(--foot);color:#fff;text-align:center;position:relative;overflow:hidden}
.cta-band::before{content:"";position:absolute;inset:0;background:radial-gradient(700px 300px at 50% 120%,rgba(${P},.45),transparent 70%)}
.cta-band .wrap{position:relative}
.cta-band h2{color:#fff}
.cta-band .lead{color:rgba(255,255,255,.75)}
.cta-band .btn-primary{background:#fff;color:#111;box-shadow:none}
.cta-band .btn-ghost{color:#fff;border-color:rgba(255,255,255,.4)}

/* 선생님 */
.t-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.t-card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:22px;display:block;color:var(--ink);transition:transform .2s,box-shadow .2s,border-color .2s}
.t-card:hover{text-decoration:none;border-color:rgba(${P},.4);transform:translateY(-2px);box-shadow:0 30px 50px -36px rgba(${SH},.5)}
.t-top{margin-bottom:10px}
.t-name{font-weight:700;font-size:1.04rem}
.t-meta{font-size:.8rem;color:var(--ink-soft)}
.t-tag{font-size:.93rem;margin:0 0 14px;min-height:2.8em;line-height:1.5}
.t-sub{display:flex;gap:5px;flex-wrap:wrap}
.t-sub b{font-weight:600;font-size:.76rem;background:rgba(${P},.1);color:var(--hl);padding:3px 10px;border-radius:999px}
.td{display:grid;grid-template-columns:1.4fr .8fr;gap:32px;align-items:start}
.td-facts{list-style:none;padding:0;margin:0}
.td-facts li{display:flex;gap:12px;padding:11px 0;border-bottom:1px solid var(--line);font-size:.95rem}
.td-facts i{font-style:normal;color:var(--ink-soft);min-width:84px}
.hidden{display:none!important}

/* 폼 */
.form-card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:34px;max-width:700px;margin:0 auto;box-shadow:0 40px 80px -50px rgba(${SH},.45)}
.field{margin-bottom:14px}
.field label{display:block;font-size:.88rem;font-weight:700;margin-bottom:6px}
.field input,.field select,.field textarea{width:100%;padding:13px 14px;border:1px solid rgba(${I},.2);border-radius:calc(var(--r) * .6 + 2px);font-size:1rem;font-family:inherit;background:var(--bg);color:var(--ink)}
.field input:focus,.field select:focus,.field textarea:focus{outline:2px solid rgba(${P},.45);outline-offset:0;border-color:var(--primary)}
.field textarea{min-height:92px;resize:vertical}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.ok{display:none;margin-top:14px;padding:13px 16px;background:var(--surface2);border:1px solid var(--line);border-radius:8px;font-weight:700;color:var(--hl)}
.contact-ways{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;max-width:900px;margin:0 auto 26px}
.contact-ways a{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:24px 18px;text-align:center;color:var(--ink);font-weight:700;transition:border-color .15s,transform .15s}
.contact-ways a:hover{text-decoration:none;border-color:var(--primary);transform:translateY(-2px)}
.contact-ways b{display:block;font-size:1.7rem;margin-bottom:8px;font-weight:400}
.contact-ways span{display:block;font-size:.82rem;color:var(--ink-soft);font-weight:500}

/* 글 목록 */
.post-list{display:grid;gap:12px}
.post-item{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:24px 26px;transition:border-color .15s}
.post-item:hover{border-color:rgba(${P},.4)}
.post-item h3{margin:6px 0 6px;font-size:1.14rem}
.post-item h3 a{color:var(--ink)}
.post-item time,.post-item .cat{font-size:.8rem;color:var(--ink-soft)}
.post-item .cat{color:var(--hl);font-weight:700;margin-right:8px}

/* 회화 */
.lang-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 22px}
.lang-tabs a{padding:9px 18px;border:1px solid var(--line);border-radius:999px;font-weight:700;background:var(--surface);color:var(--ink)}
.lang-tabs a.active,.lang-tabs a:hover{background:var(--primary);color:var(--on-primary);border-color:var(--primary);text-decoration:none}
.types{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.types div{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:20px}
.types h4{margin:0 0 10px;color:var(--hl);font-size:.95rem}
.types span{display:inline-block;background:rgba(${P},.08);border-radius:999px;padding:4px 11px;font-size:.84rem;margin:0 4px 6px 0}

/* 푸터 */
footer{background:var(--foot);color:rgba(255,255,255,.66);padding:68px 0 30px}
footer .brand{color:#fff}
.foot-grid{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:32px}
footer h5{color:#fff;margin:0 0 14px;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase}
footer ul{list-style:none;padding:0;margin:0}
footer li{margin-bottom:9px;font-size:.92rem}
footer a{color:rgba(255,255,255,.72)}
footer a:hover{color:#fff}
.copy-bar{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;border-top:1px solid rgba(255,255,255,.12);margin-top:40px;padding-top:20px;font-size:.82rem;color:rgba(255,255,255,.5)}

/* 플로팅 */
.float-cta{position:fixed;right:18px;bottom:18px;z-index:60;display:flex;gap:8px}
.float-cta .btn{box-shadow:0 18px 40px -16px rgba(0,0,0,.5)}
.btn-kakao{background:#fee500;color:#191919}

/* 간편선택 팝업(quick.js) */
.q-modal{display:none;position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);align-items:center;justify-content:center;padding:18px}
.q-modal.open{display:flex}
.quick{position:relative;width:100%;max-width:540px;max-height:calc(100vh - 36px);overflow-y:auto;background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:var(--r);padding:26px 24px 22px;box-shadow:0 50px 100px -30px rgba(0,0,0,.6)}
.q-close{position:absolute;top:10px;right:12px;background:none;border:none;color:var(--ink-soft);font-size:22px;line-height:1;cursor:pointer;font-family:inherit;padding:6px}
.q-fab{position:fixed;left:18px;bottom:18px;z-index:59;background:var(--surface);border:1px solid rgba(${P},.45);color:var(--hl);font-family:inherit;font-weight:700;font-size:.9rem;padding:12px 18px;border-radius:999px;cursor:pointer;box-shadow:0 18px 40px -16px rgba(${SH},.45)}
.quick .q-step{display:none}
.quick .q-step.on{display:block}
.q-title{font-family:var(--head);font-size:1.3rem;margin:0 0 4px}
.q-title small{display:block;font-family:var(--body);font-weight:400;font-size:.88rem;color:var(--ink-soft);margin-top:5px}
.q-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px}
.q-tiles button{font-family:inherit;cursor:pointer;background:var(--surface2);border:1px solid var(--line);color:var(--ink);font-weight:700;font-size:.9rem;padding:14px 6px;border-radius:14px;line-height:1.35}
.q-tiles button:hover{border-color:var(--primary)}
.q-tiles button b{display:block;font-size:1.25rem;margin-bottom:5px}
.q-back{background:none;border:none;color:var(--ink-soft);font-size:.86rem;cursor:pointer;font-family:inherit;padding:0;margin-bottom:10px}
.q-chosen{font-family:var(--head);font-size:1.15rem;color:var(--hl);margin-bottom:3px}
.q-hint{color:var(--ink-soft);font-size:.86rem;margin-bottom:14px}
.q-lbl{display:block;font-size:.84rem;font-weight:700;color:var(--ink-soft);margin:12px 0 6px}
.q-chips{display:flex;flex-wrap:wrap;gap:6px}
.q-chips button{font-family:inherit;cursor:pointer;background:var(--bg);border:1px solid var(--line);color:var(--ink);font-size:.85rem;font-weight:700;padding:8px 13px;border-radius:999px}
.q-chips button.sel{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.quick input,.quick textarea{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:12px;color:var(--ink);font-family:inherit;font-size:.95rem;padding:12px 13px;margin-bottom:8px}
.quick input:focus,.quick textarea:focus{outline:none;border-color:var(--primary)}
.quick textarea{resize:none;height:60px}
.q-row2{display:flex;gap:8px}
.q-submit{width:100%;font-family:inherit;cursor:pointer;background:var(--primary);border:none;color:var(--on-primary);font-weight:700;font-size:1rem;padding:15px;border-radius:var(--pill);margin-top:8px}
.q-submit[disabled]{opacity:.65;cursor:default}
.q-done{text-align:center;padding:24px 8px}
.q-done b{display:block;font-family:var(--head);font-size:1.25rem;margin-bottom:8px}
.q-done p{color:var(--ink-soft);font-size:.92rem;line-height:1.75;margin:0}
.q-links{margin-top:18px;padding-top:15px;border-top:1px solid var(--line)}
.q-links .q-lt{font-size:.84rem;color:var(--ink-soft);margin-bottom:9px}
.q-links a{display:inline-block;background:var(--surface2);border:1px solid var(--line);color:var(--ink);font-size:.85rem;font-weight:700;padding:8px 13px;border-radius:999px;margin:0 5px 6px 0}

@media(max-width:900px){
  .g3,.g4,.steps,.stat-strip{grid-template-columns:repeat(2,1fr)}
  .tiles{grid-template-columns:repeat(3,1fr)}
  .slist{grid-template-columns:1fr}
  .slist a:nth-child(odd){border-right:0;padding-right:8px}
  .slist a:nth-child(even){padding-left:8px}
  .steps::before{display:none}
  .foot-grid{grid-template-columns:1fr 1fr}
  .hero .wrap{grid-template-columns:1fr}
  .hero-side,.hero-stack{display:none}
  .td{grid-template-columns:1fr}
  .stat{border-right:0;border-bottom:1px solid var(--line)}
  .city{grid-template-columns:1fr;gap:10px}
}
@media(max-width:640px){
  section{padding:46px 0}
  .g2,.g3,.g4,.steps{grid-template-columns:1fr}
  .tiles{grid-template-columns:repeat(2,1fr)}
  .nav-links{display:none}
  .menu-btn{display:inline-block}
  .nav{display:flex;padding:10px 0;gap:10px}
  .brand{font-size:1.12rem;white-space:nowrap}
  .brand small{display:none}
  .nav-cta{margin-left:auto;flex:none}
  .nav-cta .btn-sm{padding:7px 12px;font-size:.84rem}
  .foot-grid{grid-template-columns:1fr}
  .row2{grid-template-columns:1fr}
  .hero-facts{gap:16px}
  .hero-facts>div{min-width:40%}
  .hero-search{flex-direction:column;border-radius:20px;gap:6px}
  .hero-search button{padding:13px}
  .sgrid{grid-template-columns:repeat(2,1fr)}
  .rgrid{grid-template-columns:repeat(2,1fr)}
  .q-tiles{grid-template-columns:repeat(2,1fr)}
  .q-fab{bottom:74px;left:12px;font-size:.85rem;padding:10px 15px}
  .float-cta{left:12px;right:12px;bottom:12px}
  .float-cta .btn{flex:1;justify-content:center;white-space:nowrap;padding:12px 10px;font-size:.92rem}
  br.pc{display:none}
  .topbar{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.78rem}
}
`;
}

module.exports = { buildCss };
