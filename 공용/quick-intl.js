/* 국제학교튜터 첫 화면 팝업 "어떤 도움이 필요하세요?" (2026-11-03)
   같은 회사 동료 사이트(internationaledu.co.kr)의 간편 상담 팝업과 같은 흐름·모양:
     1단계 필요한 수업 타일 → 2단계 학년·이름·연락처·주소(해외 번호면 카톡 ID) → 3단계 완료 + 둘러볼 링크
   신청은 상담 폼과 같은 허브 Apps Script(티쳐포유 시트 + 메일)로 보낸다. run.js 가 앞머리 QCFG 를 붙인다. */
const BODY = String.raw`
(function(){
  var C = window.QCFG;
  function esc(s){ return String(s == null ? '' : s).replace(/[<>&"]/g, function(c){ return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]; }); }
  /* 한국 번호 판별(+82·0으로 시작=한국, 그 외 해외) */
  function isKR(p){ var s = (p || '').replace(/[\s().\-]/g, ''); if (s.charAt(0) === '+') return /^\+82/.test(s); return /^0\d/.test(s); }

  var CSS = '.q-modal{display:none;position:fixed;inset:0;z-index:200;background:rgba(10,10,14,.62);backdrop-filter:blur(3px);align-items:center;justify-content:center;padding:20px}.q-modal.open{display:flex}' +
    '.quick{position:relative;width:100%;max-width:620px;max-height:calc(100vh - 40px);overflow-y:auto;background:#211f26;color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:22px 22px 20px;box-shadow:0 30px 80px rgba(0,0,0,.55)}' +
    '.quick .q-close{position:absolute;top:10px;right:12px;background:none;border:none;color:#8c8f99;font-size:22px;line-height:1;cursor:pointer;font-family:inherit;padding:6px}.quick .q-close:hover{color:#fff}' +
    '.q-open-btn{display:inline-flex;align-items:center;gap:8px;margin-top:18px;background:rgba(245,181,61,.12);border:1px solid rgba(245,181,61,.45);color:#c98a10;font-family:inherit;font-weight:800;font-size:14px;padding:11px 20px;border-radius:999px;cursor:pointer;transition:all .15s}.q-open-btn:hover{background:rgba(245,181,61,.22);transform:translateY(-1px)}' +
    '.q-fab{position:fixed;left:18px;bottom:18px;z-index:60;background:#211f26;border:1px solid rgba(245,181,61,.55);color:#f5b53d;font-family:inherit;font-weight:800;font-size:13.5px;padding:12px 18px;border-radius:999px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.35)}' +
    '.quick .q-step{display:none}.quick .q-step.on{display:block}' +
    '.quick .q-title{font-weight:900;font-size:17px;color:#fff;margin-bottom:13px}.quick .q-title small{display:block;font-weight:500;font-size:12.5px;color:#b8bac2;margin-top:3px}' +
    '.quick .q-tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.quick .q-tiles button:last-child{grid-column:1/-1;padding:16px 6px;font-size:15px;border-color:rgba(245,181,61,.45);background:rgba(245,181,61,.1)}' +
    '.quick .q-tiles button{font-family:inherit;cursor:pointer;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);color:#fff;font-weight:700;font-size:13.5px;padding:13px 6px;border-radius:12px;line-height:1.35;transition:all .15s}' +
    '.quick .q-tiles button:hover{border-color:#ef5a3c;background:rgba(239,90,60,.14);transform:translateY(-1px)}.quick .q-tiles button b{display:block;font-size:19px;margin-bottom:5px}' +
    '.quick .q-etc{margin-top:11px;background:none;border:none;color:#9a9da8;font-size:12.5px;cursor:pointer;font-family:inherit;text-decoration:underline;text-underline-offset:3px;padding:2px}.quick .q-etc:hover{color:#f5b53d}' +
    '.quick .q-back{background:none;border:none;color:#9a9da8;font-size:12.5px;cursor:pointer;font-family:inherit;padding:0;margin-bottom:9px}.quick .q-back:hover{color:#fff}' +
    '.quick .q-chosen{font-weight:900;color:#f5b53d;font-size:15px;margin-bottom:3px}.quick .q-hint{color:#b8bac2;font-size:12.5px;margin-bottom:12px}' +
    '.quick .q-grades{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:11px}' +
    '.quick .q-grades button{font-family:inherit;cursor:pointer;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);color:#dfe0e5;font-size:12.5px;font-weight:700;padding:7px 12px;border-radius:999px}.quick .q-grades button.sel{background:#ef5a3c;border-color:#ef5a3c;color:#fff}' +
    '.quick input,.quick textarea{width:100%;box-sizing:border-box;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);border-radius:10px;color:#fff;font-family:inherit;font-size:14px;padding:11px 13px;margin:0 0 8px}' +
    '.quick input::placeholder,.quick textarea::placeholder{color:#8c8f99}.quick textarea{resize:none;height:58px}.quick input:focus,.quick textarea:focus{outline:none;border-color:#f5b53d}' +
    '.quick .q-row2{display:flex;gap:8px}' +
    '.quick .q-submit{width:100%;font-family:inherit;cursor:pointer;background:#ef5a3c;border:none;color:#fff;font-weight:900;font-size:15.5px;padding:14px;border-radius:12px;margin-top:3px}.quick .q-submit:hover{box-shadow:0 10px 22px rgba(239,90,60,.4)}' +
    '.quick .q-done{text-align:center;padding:26px 8px}.quick .q-done b{display:block;color:#fff;font-size:17px;margin-bottom:7px}.quick .q-done p{color:#b8bac2;font-size:13.5px;line-height:1.7;margin:0}.quick .q-done p a{color:#f5b53d}' +
    '.quick .q-links{margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12)}.quick .q-lt{font-size:12.5px;color:#9a9da8;margin-bottom:9px}' +
    '.quick .q-links a{display:inline-block;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);color:#fff;font-size:12.5px;font-weight:700;text-decoration:none;padding:8px 13px;border-radius:999px;margin:0 5px 6px 0}.quick .q-links a:hover{border-color:#f5b53d;color:#f5b53d}' +
    '@media (max-width:640px){.quick .q-tiles{grid-template-columns:repeat(2,1fr)}.quick .q-tiles button:last-child{grid-column:1/-1}.q-fab{bottom:76px}}';

  var HTML =
    '<button type="button" class="q-close" aria-label="닫기">✕</button>' +
    '<div class="q-step q-s1 on">' +
      '<div class="q-title">어떤 도움이 필요하세요?<small>클릭 한 번이면 딱 맞는 선생님을 안내해 드립니다</small></div>' +
      '<div class="q-tiles">' + C.tiles.map(function(t){ return '<button type="button" data-s="' + esc(t[0]) + '" data-h="' + esc(t[2]) + '"><b>' + t[1] + '</b>' + esc(t[0]) + '</button>'; }).join('') + '</div>' +
      '<button type="button" class="q-etc" data-s="기타" data-h="필요하신 내용을 적어 주시면 전문가가 안내해 드립니다">찾는 게 없나요? 기타 문의 →</button>' +
    '</div>' +
    '<div class="q-step q-s2">' +
      '<button type="button" class="q-back">← 다시 선택</button>' +
      '<div class="q-chosen"></div><div class="q-hint"></div>' +
      '<div class="q-grades">' + C.grades.map(function(g){ return '<button type="button">' + esc(g) + '</button>'; }).join('') + '</div>' +
      '<div class="q-row2"><input type="text" id="q_name" placeholder="학생 이름 * (예: 김민준)" autocomplete="off"><input type="tel" id="q_phone" placeholder="연락처 *" autocomplete="tel"></div>' +
      '<input type="text" id="q_addr" placeholder="도로명 주소 (해외는 국가·도시만 대략 적어 주세요)" autocomplete="street-address">' +
      '<input type="text" id="q_kakao" placeholder="카카오톡 ID (해외 번호는 꼭 적어 주세요)" style="display:none">' +
      '<textarea id="q_memo" placeholder="원하시는 수업이나 궁금한 점을 편하게 적어 주세요 (선택)"></textarea>' +
      '<button type="button" class="q-submit">상담 신청하기</button>' +
    '</div>' +
    '<div class="q-step q-s3">' +
      '<div class="q-done"><b>✅ 신청이 접수되었습니다!</b><p>전문 선생님이 확인 후 곧 연락드리겠습니다.<br>급하시면 <a href="tel:' + C.telRaw + '">' + C.tel + '</a> 로 전화 주세요.</p>' +
        '<div class="q-links"><div class="q-lt">연락 기다리는 동안 둘러보세요 👀</div><div class="q-llist"></div></div>' +
      '</div>' +
    '</div>';

  function init(){
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var modal = document.createElement('div'); modal.className = 'q-modal';
    var box = document.createElement('div'); box.className = 'quick'; box.innerHTML = HTML;
    modal.appendChild(box); document.body.appendChild(modal);
    var s1 = box.querySelector('.q-s1'), s2 = box.querySelector('.q-s2'), s3 = box.querySelector('.q-s3');
    var subject = '', grade = '';
    function show(x){ [s1, s2, s3].forEach(function(e){ e.classList.remove('on'); }); x.classList.add('on'); }
    function open(){ modal.classList.add('open'); if (typeof gtag === 'function') gtag('event', 'quick_open'); }
    function close(){ modal.classList.remove('open'); }

    var opener = document.getElementById('quickOpen');
    if (opener) opener.addEventListener('click', open);
    else { var fab = document.createElement('button'); fab.type = 'button'; fab.className = 'q-fab'; fab.textContent = '⚡ 간편 상담'; fab.addEventListener('click', open); document.body.appendChild(fab); }
    box.querySelector('.q-close').addEventListener('click', close);
    modal.addEventListener('click', function(e){ if (e.target === modal) close(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });

    /* 첫 화면(홈)은 들어올 때마다 자동으로 연다(2026-11-03 사용자 요청). 다른 페이지는 한 방문에 한 번만. ?nopop 이면 열지 않음 */
    var pth = location.pathname, home = pth === '/' || pth === '/index.html' || (location.protocol === 'file:' && pth.slice(-10) === 'index.html');
    try {
      if (!/[?&]nopop/.test(location.search)) {
        /* 2026-11-11: 들어오자마자 첫 화면을 가리지 않게 — 한 방문에 한 번, 25초 지나거나 화면 절반쯤 내렸을 때 연다 */
        if (!sessionStorage.getItem('qpick2')) {
          var fired = false, fire = function(){ if (fired || modal.classList.contains('open') || document.querySelector('.q-modal.open')) return; fired = true; sessionStorage.setItem('qpick2', '1'); open(); };
          setTimeout(fire, home ? 25000 : 30000);
          window.addEventListener('scroll', function(){ var d = document.documentElement; if ((window.scrollY + innerHeight) / d.scrollHeight > 0.55) fire(); }, { passive: true });
        }
      }
    } catch (_) {}

    box.querySelectorAll('[data-s]').forEach(function(b){
      b.addEventListener('click', function(){
        subject = b.getAttribute('data-s');
        box.querySelector('.q-chosen').textContent = subject;
        box.querySelector('.q-hint').textContent = b.getAttribute('data-h') || '';
        show(s2);
        if (typeof gtag === 'function') gtag('event', 'quick_pick', { tile: subject });
      });
    });
    var qPhone = document.getElementById('q_phone'), qKakao = document.getElementById('q_kakao');
    function toggleKakao(){ qKakao.style.display = (qPhone.value.trim() !== '' && !isKR(qPhone.value)) ? '' : 'none'; }
    qPhone.addEventListener('input', toggleKakao); qPhone.addEventListener('blur', toggleKakao);
    box.querySelector('.q-back').addEventListener('click', function(){ show(s1); });
    box.querySelectorAll('.q-grades button').forEach(function(g){
      g.addEventListener('click', function(){ box.querySelectorAll('.q-grades button').forEach(function(x){ x.classList.remove('sel'); }); g.classList.add('sel'); grade = g.textContent; });
    });

    box.querySelector('.q-submit').addEventListener('click', function(){
      var v = function(id){ return document.getElementById(id).value.trim(); };
      var name = v('q_name'), phone = v('q_phone'), kakao = v('q_kakao'), addr = v('q_addr'), memo = v('q_memo');
      if (!name || !phone) { alert('학생 이름과 연락처를 입력해 주세요.'); return; }
      if (!isKR(phone) && !kakao) { qKakao.style.display = ''; qKakao.focus(); alert('한국 번호가 아니면 전화 연락이 어려워요.\n카카오톡 ID를 적어 주시면 빠르게 안내해 드립니다.'); return; }
      var extra = (kakao ? '[카톡 ID] ' + kakao + ' / ' : '') + (addr ? '[주소] ' + addr + ' / ' : '') + memo;
      /* form.js 와 같은 항목 이름 — 한글 키 + 영문 키(티쳐포유 Apps Script 는 영문 키만 읽는다) */
      var d = new URLSearchParams({
        sheet: C.tab, _form: C.site, _time: new Date().toLocaleString('ko-KR'),
        사이트: C.site, 이름: name, 연락처: phone, 학년: grade, 과목: subject, 주소: addr,
        남길말: '[간편상담] ' + extra, 신청페이지: location.origin + location.pathname,
        name: '[' + C.site + '] ' + name, phone: phone, grade: grade, subject: subject, address: addr, kakao: kakao,
        memo: '[' + C.site + '][간편상담] ' + extra + ' / ' + location.pathname
      });
      if (C.ep) fetch(C.ep, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }, body: d.toString() }).catch(function(){});
      if (typeof gtag === 'function') gtag('event', 'quick_submit', { tile: subject, grade: grade });
      var list = box.querySelector('.q-llist'); list.innerHTML = '';
      (C.links[subject] || C.links['기타']).forEach(function(l){ var a = document.createElement('a'); a.textContent = l[0]; a.href = l[1]; list.appendChild(a); });
      show(s3);
    });
  }
  /* 2026-11-10: 카톡 상담 버튼 — 카톡방을 열기 전에 이름·연락처를 먼저 받아 상담 시트에 남긴다
     (카톡으로만 상담하면 연락처 확보가 어렵다는 사용자 요청). 한 번 남긴 브라우저는 다음부터 바로 카톡방이 열린다. */
  function kakaoGate(){
    var links = document.querySelectorAll('a[href*="open.kakao.com"]');
    if (!links.length) return;
    var m = document.createElement('div');
    m.className = 'q-modal'; m.id = 'kgate';
    m.innerHTML = '<div class="quick" role="dialog" aria-label="카카오톡 상담"><button class="q-close" type="button" aria-label="닫기">×</button>' +
      '<div class="q-title">💛 카카오톡 상담 시작<small>상담이 중간에 끊겨도 다시 연락드릴 수 있게 먼저 남겨 주세요</small></div>' +
      '<div class="q-row2"><input type="text" id="k_name" placeholder="학생 이름 * (예: 김민준)" autocomplete="off"><input type="tel" id="k_phone" placeholder="연락처 * (해외는 카톡 ID도 OK)" autocomplete="tel"></div>' +
      '<input type="text" id="k_grade" placeholder="학교·학년 (예: 송도 채드윅 G8)">' +
      '<button class="q-submit" type="button">카카오톡 상담 열기 →</button>' +
      '<p class="q-hint" style="margin:10px 0 0">입력하신 정보는 상담 연락에만 사용합니다.</p></div>';
    document.body.appendChild(m);
    var href = '';
    function close(){ m.classList.remove('open'); }
    m.querySelector('.q-close').addEventListener('click', close);
    m.addEventListener('click', function(e){ if (e.target === m) close(); });
    links.forEach(function(a){
      a.addEventListener('click', function(e){
        try { if (localStorage.getItem('kgate')) return; } catch (x) {}
        e.preventDefault(); href = a.href; m.classList.add('open');
        setTimeout(function(){ document.getElementById('k_name').focus(); }, 50);
      });
    });
    m.querySelector('.q-submit').addEventListener('click', function(){
      var v = function(id){ return document.getElementById(id).value.trim(); };
      var name = v('k_name'), phone = v('k_phone'), grade = v('k_grade');
      if (!name || !phone) { alert('학생 이름과 연락처(해외는 카톡 ID)를 입력해 주세요.'); return; }
      var d = new URLSearchParams({
        sheet: C.tab, _form: C.site, _time: new Date().toLocaleString('ko-KR'),
        사이트: C.site, 이름: name, 연락처: phone, 학년: grade, 과목: '카톡상담', 남길말: '[카톡상담 시작]', 신청페이지: location.origin + location.pathname,
        name: '[' + C.site + '] ' + name, phone: phone, grade: grade, subject: '카톡상담',
        memo: '[' + C.site + '][카톡상담 시작] ' + location.pathname
      });
      if (C.ep) fetch(C.ep, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }, body: d.toString() }).catch(function(){});
      if (typeof gtag === 'function') gtag('event', 'kakao_gate_submit');
      try { localStorage.setItem('kgate', '1'); } catch (x) {}
      close();
      window.open(href, '_blank', 'noopener');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kakaoGate); else kakaoGate();
})();
`;
module.exports = { BODY };
