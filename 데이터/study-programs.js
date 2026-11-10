/* 유학 프로그램 (유학 메뉴 study.html 의 "모집 중" 카드 + study/<slug>.html 상세 페이지) — 2026-11-10
   - 사용자가 회사 자료(학교 안내 PDF 등)를 주면 여기에 한 항목씩 추가한다.
   - 회사 내부 정보(모집 수수료·정산·직원용 안내·내부 담당자)는 넣지 않는다. 학교가 공개하는 학비·일정·과정만.
   - 학교 자료의 사진은 저작권이 학교에 있으므로 쓰지 않는다(글·표로만).
   - body 는 HTML(p h2 h3 ul li b table). 비용·일정은 바뀔 수 있다는 안내를 꼭 넣는다. */
const PROGRAMS = [
  {
    slug: 'ef-academy-aeap-2027',
    date: '2026-11-10',
    status: '모집 중',
    country: '미국',
    school: 'EF Academy · 뉴욕 / 패서디나',
    title: 'EF Academy 고등학교 예비 과정(AEAP) 2027 — 영어 준비하고 미국 보딩스쿨 9월 입학',
    short: '중3~고2 예비 신입생이 미국 보딩스쿨 캠퍼스에서 영어·교과목을 먼저 배우고 2027년 9월 정규 과정에 들어가는 예비 과정입니다.',
    facts: [['대상', 'G9~G11 (중3~고2 수준) 예비 신입생'], ['시작', '2027년 1월 · 4월 · 6월'], ['캠퍼스', '패서디나(캘리포니아) · 뉴욕'], ['이후', '2027년 9월 EF Academy 정규 과정']],
    keywords: 'EF Academy, 미국 보딩스쿨, 보딩스쿨 예비과정, AEAP, 미국 고등학교 유학, 조기유학, 미국 유학 영어 준비',
    body: `
<p>영어가 아직 부족해서 미국 보딩스쿨 입학이 망설여진다면, 입학 전에 <b>같은 학교 캠퍼스에서 영어와 교과목을 먼저 준비하는 과정</b>이 있습니다. EF Academy의 <b>Academic English Accelerator Program(AEAP, 고등학교 예비 과정)</b>입니다.</p>

<h2>어떤 과정인가요?</h2>
<table>
<tr><th>대상</th><td>G9~G11(중3~고2 수준) 예비 신입생<br><span class="muted small">11학년은 Summer 과정 참여 가능, Winter·Spring 과정은 학교 입학처에 따로 확인이 필요합니다.</span></td></tr>
<tr><th>목표</th><td>영어로 진행되는 고등학교 교과목 수업과 교과외 활동을 미리 경험하며 정규 과정을 준비</td></tr>
<tr><th>수업 내용</th><td>EAL(영어) 실력 쌓기와 수학·과학·역사 등 교과목 선행<br>리서치·발표·토론·에세이 같은 실제 학교생활에 필요한 능력 준비<br>방과 후 클럽·스포츠 활동, 주말 활동</td></tr>
</table>

<h2>2027년 일정과 학비</h2>
<table>
<tr><th>과정</th><th>캠퍼스</th><th>시작일</th><th>기간</th><th>학비</th><th>장학 혜택</th><th>최종 비용</th></tr>
<tr><td>Winter</td><td>패서디나</td><td>2027.1.27</td><td>30주</td><td>USD 45,500</td><td>USD 15,600</td><td><b>USD 29,900</b></td></tr>
<tr><td>Spring</td><td>패서디나</td><td>2027.4.27</td><td>17주</td><td>USD 28,000</td><td>USD 8,100</td><td><b>USD 19,900</b></td></tr>
<tr><td>Summer</td><td>뉴욕</td><td>2027.6.27</td><td>9주</td><td>USD 13,900</td><td>—</td><td><b>USD 13,900</b></td></tr>
</table>
<ul>
<li>Winter 과정은 중간에 봄방학(3/6~3/21)이 있습니다.</li>
<li>Winter·Spring 과정은 8월 첫째 주에 끝나고, 9월부터 정규 학기로 이어집니다.</li>
<li>학비·장학 혜택·일정은 학교 사정에 따라 바뀔 수 있습니다. 신청 전 상담에서 최신 안내를 꼭 확인하세요.</li>
</ul>

<h2>과정별로 이런 학생에게 맞아요</h2>
<h3>Winter (30주, 1~8월, 패서디나)</h3>
<ul>
<li>영어가 기초 수준인 학생 (EF SET 기준 High A1~Low A2, 듀오링고 40~50 정도)</li>
<li>6개월 이상 집중해서 영어 실력과 자신감을 키워야 하는 학생</li>
<li>수업: Intensive English 1·2, Academic Research Skills, Math, Art/Music, Academic Support</li>
</ul>
<h3>Spring (17주, 4~8월, 패서디나)</h3>
<ul>
<li>영어로 의사소통은 되지만 아카데믹 영어 준비가 필요한 학생 (듀오링고 50~60 정도)</li>
<li>수업: Intensive English 1·2, Literature, Math, History, Science, Art/Music, Academic Support</li>
</ul>
<h3>Summer (9주, 6~8월, 뉴욕)</h3>
<ul>
<li>영어 소통은 되지만 보딩스쿨 생활과 수업을 미리 경험해 보고 싶은 학생 (듀오링고 50~60 정도)</li>
<li>Spring과 같은 교과에 더해, 6~8월 중 금요일 6번은 뉴욕 안팎에서 체험학습(Experiential Learning)</li>
</ul>
<p>세 과정 모두 주 2회 저녁 게임형 영어 수업(Gamified English Lessons)과 주 2회 AI 튜터 수업이 함께 있습니다.</p>

<h2>참여하면 기대할 수 있는 것</h2>
<ol>
<li><b>아카데믹 영어 향상</b> — 학교는 영어 레벨이 최대 두 단계까지 오를 수 있다고 안내합니다(예: A1→B1, A2→B2).</li>
<li><b>학점</b> — 수강 기간과 과목에 따라 학점이 주어지고 성적표에 기재됩니다.</li>
<li><b>보딩스쿨 생활 미리 체험</b> — 정규 학생과 같은 기숙사·클럽·스포츠·주말 활동에 참여합니다(1~5월은 정규 학생과 같은 클럽, 6월 이후는 AEAP 학생 클럽).</li>
<li><b>정규 과정으로 자연스럽게 연결</b> — 교과목·영어·캠퍼스를 먼저 경험하고 9월 정규 과정을 시작합니다.</li>
</ol>

<h2>학년별 로드맵</h2>
<table>
<tr><th>지금 학년</th><th>2027년 1·4·6월</th><th>2027년 9월 학기</th></tr>
<tr><td>중3</td><td rowspan="3">AEAP 예비 과정<br>(뉴욕 / 패서디나)</td><td>9학년 — EAL 서포트(과제·수업)</td></tr>
<tr><td>고1</td><td>10학년 — EAL 서포트 / AP · IB 준비 과정</td></tr>
<tr><td>고2</td><td>11학년 — AP 또는 IB 과정 선택</td></tr>
</table>

<h2>학교 안내 자료에 소개된 사례</h2>
<ul>
<li><b>국내 일반고 2학년 → 11학년 입학</b>: 영어 준비가 덜 돼 1년 동안 예비 과정을 들은 뒤 11학년 IB 정규 과정으로 이어 갔고, 이후 Embry-Riddle Aeronautical University 항공 조종학과에 진학했습니다.</li>
<li><b>중3 → 9학년 입학</b>: 1~6월 예비 과정을 마치고 9월 뉴욕 캠퍼스 9학년으로 입학해 졸업했습니다. IBDP를 마치고 Parsons(패션디자인)에 진학했고, FIT·SCAD·SAIC·Pratt 등에도 합격했습니다.</li>
</ul>
<p class="small muted">위 사례는 EF Academy가 안내 자료에서 소개한 내용입니다. 결과는 학생마다 다릅니다.</p>

<h2>출국 전, 국제학교튜터와 함께 준비하세요</h2>
<p>예비 과정에 들어가기 전에 영어 리딩·에세이와 영어로 하는 수학·과학 용어를 미리 익혀 두면 첫 학기 적응이 훨씬 편합니다. 국제학교튜터는 <b>1:1 실시간 화상 수업</b>으로 출국 전 준비와 입학 후 과제·에세이까지 이어서 도와드립니다. 상담을 남겨 주시면 프로그램 안내와 함께 아이에게 맞는 준비 계획을 알려 드립니다.</p>`
  }
];

module.exports = { PROGRAMS };
