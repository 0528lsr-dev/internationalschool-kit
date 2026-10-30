/* 간편선택 팝업 생성기 — 각 지역 사이트의 quick.js 를 만든다.
   내용은 사이트마다 같고 앞머리 QCFG(브랜드·지역·읍면동·링크)만 다르다.
   다른 사이트의 "어떤 도움이 필요하세요?" 와 같은 흐름:
     1단계 과목 타일 → 2단계 학년·연락처 → 허브 Apps Script 로 전송(sheet=지역과외) → 3단계 완료
   스타일은 style.css 의 .q-* 규칙(사이트 테마색을 그대로 씀). */

const HUB = 'https://script.google.com/macros/s/여기에_Apps_Script_배포_ID/exec';   // 학교과외 생성기는 이 파일의 BODY 만 쓰고 설정(QCFG)은 run.js 에서 넣는다

/* 과목 9가지 — [이름, 아이콘, 한 줄 설명] */
const TILES = [
  ['국어과외', '📖', '교과서 지문과 서술형을 학교 시험에 맞춰 함께 봅니다'],
  ['영어과외', '🔤', '단어·문법부터 서술형까지 학교별 기출로 준비합니다'],
  ['수학과외', '📐', '지금 진도와 빠진 단원을 같이 찾아 메웁니다'],
  ['과학과외', '🔬', '개념과 그래프·실험 문제를 함께 정리합니다'],
  ['사회과외', '🗺️', '흐름을 먼저 잡고 서술형 문장으로 정리합니다'],
  ['한국사과외', '🏛️', '시대 흐름부터 수능 한국사까지 단계별로'],
  ['자기주도학습과외', '🧭', '공부 계획과 습관부터 같이 만들어 갑니다'],
  ['코딩과외', '💻', '정보 교과·블록코딩부터 파이썬까지'],
  ['영어회화과외', '💬', '말하기 중심 1:1 수업으로 입을 틔웁니다']
];

/* 2026-10-04 사용자 요청: 초등은 학년별로 하나씩 */
const GRADES = ['초1', '초2', '초3', '초4', '초5', '초6', '중1', '중2', '중3', '고1', '고2', '고3·재수생'];

/* 사이트마다 달라지지 않는 본문 */
const BODY = String.raw`
(function(){
  var C = window.QCFG;
  var TILES = C.tiles, GRADES = C.grades;

  function el(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }
  function esc(s){ return String(s == null ? '' : s).replace(/[<>&"]/g, function(c){ return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]; }); }

  function build(){
    var box = el('div', 'quick');
    box.innerHTML =
      '<button type="button" class="q-close" aria-label="닫기">✕</button>' +
      '<div class="q-step q-s1 on">' +
        '<div class="q-title">어떤 도움이 필요하세요?<small>과목만 고르시면 맞는 선생님을 찾아 연락드립니다</small></div>' +
        '<div class="q-tiles">' +
          TILES.map(function(t){
            return '<button type="button" data-s="' + esc(t[0]) + '" data-h="' + esc(t[2]) + '"><b>' + t[1] + '</b>' + esc(t[0]) + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="q-step q-s2">' +
        '<button type="button" class="q-back">← 다시 고르기</button>' +
        '<div class="q-chosen"></div><div class="q-hint"></div>' +
        '<span class="q-lbl">학년</span>' +
        '<div class="q-chips q-grades">' + GRADES.map(function(g){ return '<button type="button">' + esc(g) + '</button>'; }).join('') + '</div>' +
        (C.hasVisit ? '<span class="q-lbl">수업 방식</span><div class="q-chips q-modes"><button type="button">화상수업</button><button type="button">방문수업(국내)</button><button type="button">상관없음</button></div>' : '') +
        '<span class="q-lbl">연락처</span>' +
        '<div class="q-row2">' +
          '<input type="text" id="q_name" placeholder="이름 *" autocomplete="name">' +
          '<input type="tel" id="q_phone" placeholder="연락처 *" autocomplete="tel">' +
        '</div>' +
        /* 2026-10-04 사용자 요청: 학교·주소·특이사항 모두 필수 */
        '<input type="text" id="q_school" placeholder="학교 * (예: 채드윅송도)">' +
        '<input type="text" id="q_addr" placeholder="사는 곳 * (나라·도시)" autocomplete="street-address">' +
        '<textarea id="q_memo" placeholder="특이사항 * (원하시는 요일·시간, 아이 상황 등)"></textarea>' +
        '<button type="button" class="q-submit">바로 신청하기</button>' +
      '</div>' +
      '<div class="q-step q-s3">' +
        '<div class="q-done"><b>✅ 신청이 접수되었습니다</b>' +
          '<p>확인 후 곧 연락드리겠습니다.<br>급하시면 <a href="tel:' + C.telRaw + '">' + C.tel + '</a> 로 전화 주세요.</p>' +
          '<div class="q-links"><div class="q-lt">연락 기다리는 동안 둘러보세요 👀</div><div class="q-llist">' +
            C.links.map(function(l){ return '<a href="' + l[1] + '">' + esc(l[0]) + '</a>'; }).join('') +
          '</div></div>' +
        '</div>' +
      '</div>';
    return box;
  }

  function init(){
    var modal = el('div', 'q-modal');
    var box = build();
    modal.appendChild(box);
    document.body.appendChild(modal);

    var s1 = box.querySelector('.q-s1'), s2 = box.querySelector('.q-s2'), s3 = box.querySelector('.q-s3');
    var subject = '', grade = '', mode = '';
    function show(x){ [s1, s2, s3].forEach(function(e){ e.classList.remove('on'); }); x.classList.add('on'); }
    function open(){ modal.classList.add('open'); if (typeof gtag === 'function') gtag('event', 'quick_open'); }
    function close(){ modal.classList.remove('open'); }

    /* 여는 버튼: 페이지에 #quickOpen 이 있으면 그것, 없으면 왼쪽 아래 작은 버튼 */
    var opener = document.getElementById('quickOpen');
    if (opener) opener.addEventListener('click', open);
    else {
      var fab = el('button', 'q-fab', '⚡ 어떤 도움이 필요하세요?');
      fab.type = 'button';
      fab.addEventListener('click', open);
      document.body.appendChild(fab);
    }
    box.querySelector('.q-close').addEventListener('click', close);
    modal.addEventListener('click', function(e){ if (e.target === modal) close(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });

    /* 처음 들어온 방문자에게만 한 번 자동으로 연다(같은 방문 중에는 다시 열지 않음) */
    try {
      if (!sessionStorage.getItem('qpick')) {
        sessionStorage.setItem('qpick', '1');
        setTimeout(open, 1400);
      }
    } catch (_) {}

    box.querySelectorAll('.q-tiles [data-s]').forEach(function(b){
      b.addEventListener('click', function(){
        subject = b.getAttribute('data-s');
        box.querySelector('.q-chosen').textContent = subject;
        box.querySelector('.q-hint').textContent = b.getAttribute('data-h') || '';
        show(s2);
        if (typeof gtag === 'function') gtag('event', 'quick_pick', { tile: subject });
      });
    });
    box.querySelector('.q-back').addEventListener('click', function(){ show(s1); });

    function chips(sel, set){
      var list = box.querySelectorAll(sel + ' button');
      list.forEach(function(b){
        b.addEventListener('click', function(){
          list.forEach(function(x){ x.classList.remove('sel'); });
          b.classList.add('sel'); set(b.textContent);
        });
      });
    }
    chips('.q-grades', function(v){ grade = v; });
    if (C.hasVisit) chips('.q-modes', function(v){ mode = v; });

    box.querySelector('.q-submit').addEventListener('click', function(){
      var btn = this;
      var v = function(id){ var e = document.getElementById(id); return e ? e.value.trim() : ''; };
      var name = v('q_name'), phone = v('q_phone');
      var need = [['q_name', '이름'], ['q_phone', '연락처'], ['q_school', '학교'], ['q_addr', '주소'], ['q_memo', '특이사항']];
      for (var i = 0; i < need.length; i++) {
        if (!v(need[i][0])) { alert(need[i][1] + '을(를) 입력해 주세요.'); document.getElementById(need[i][0]).focus(); return; }
      }
      btn.disabled = true; btn.textContent = '접수 중…';
      var memo = v('q_memo');
      /* form.js 와 같은 항목 이름으로 보내야 같은 시트 칸에 들어간다  */
      var d = new URLSearchParams({
        sheet: C.tab, _form: C.site, _time: new Date().toLocaleString('ko-KR'),
        사이트: C.site, 지역: C.area,
        이름: name, 연락처: phone, 학교: v('q_school'),
        학년: grade, 과목: subject, 수업방식: (mode || (C.hasVisit ? '' : '화상수업')),
        주소: v('q_addr'), 선생님성별: '',
        남길말: '[간편선택] ' + memo,
        신청페이지: location.origin + location.pathname,
        /* 영문 이름 — 티쳐포유 Apps Script 는 영문 키만 읽는다(2026-10-27). 한글 키와 같이 보낸다 */
        name: '[' + C.site + '] ' + name, phone: phone, grade: grade, subject: subject, address: v('q_addr'),
        memo: '[' + C.site + '][간편선택] 학교: ' + v('q_school') + (mode ? ' / ' + mode : '') + ' / ' + memo + ' / ' + location.pathname
      });
      if (C.ep) fetch(C.ep, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: d.toString()
      }).catch(function(){});
      if (typeof gtag === 'function') gtag('event', 'quick_submit', { tile: subject, grade: grade });
      show(s3);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
`;

function quickJs(R){
  const cfg = {
    ep: HUB,
    tab: '지역과외',
    site: R.brand,
    area: R.full,
    tel: '010-0000-0000',
    telRaw: '01000000000',
    hasVisit: !!R.hasVisit,
    dongs: R.dongs,
    tiles: TILES,
    grades: GRADES,
    links: [
      [`${R.name} 학교별 과외`, `${R.siteUrl}/schools`],
      ['화상과외 안내', `${R.siteUrl}/online`],
      [`${R.name} 지역 소식`, `${R.siteUrl}/blog`]
    ]
  };
  return `/* ${R.brand} — 간편선택 팝업 (생성기 출력물: 공용/quickpick.js)
   과목 타일 → 학년·연락처 → 허브 Apps Script 로 전송(sheet=${cfg.tab}). 손으로 고치지 말 것. */
window.QCFG=${JSON.stringify(cfg)};
${BODY}`;
}

module.exports = { quickJs };
