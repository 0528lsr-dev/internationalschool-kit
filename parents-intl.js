/* 국제학교 학부모 영어 — 상황별 상세 페이지 (2026-11-18 사용자 요청: "카드 누르면 각 페이지 열리게")
   parents/<key>.html 로 나간다. parents.html 의 카드 6개와 같은 순서.
   예문은 실제 학교에서 쓰는 자연스러운 영어 + 한국어 뜻. 가격·숫자·후기는 넣지 않는다. 말트임 문장 복사 금지. */
module.exports = [
  {
    key: 'ptc', ico: '🧑‍🏫', name: '학부모 상담(PTC)',
    title: '국제학교 학부모 상담(PTC) 영어 — 질문 준비부터 실전 연습까지',
    h1: '학부모 상담(PTC) 영어',
    lead: '학기마다 한두 번 있는 Parent-Teacher Conference는 보통 짧은 시간 안에 끝납니다. 선생님 설명을 정확히 알아듣고, 꼭 묻고 싶은 질문을 영어로 바로 꺼낼 수 있게 미리 준비합니다.',
    sections: [
      ['선생님이 자주 쓰는 표현', [
        ['She is on track for this unit.', '이번 단원은 계획대로 잘 따라가고 있어요.'],
        ['He needs some support with written responses.', '서술형 답안 쓰기에 도움이 좀 필요해요.'],
        ['She is meeting expectations in math.', '수학은 학년 기준에 맞게 하고 있어요.'],
        ['He could participate more in class discussions.', '수업 토론에 좀 더 참여하면 좋겠어요.']
      ]],
      ['부모가 묻기 좋은 질문', [
        ['What are his strengths, and where does he need the most help?', '아이가 잘하는 것과 가장 도움이 필요한 부분은 무엇인가요?'],
        ['How can we support her learning at home?', '집에서 어떻게 도와주면 좋을까요?'],
        ['Is she getting along well with her classmates?', '친구들과는 잘 지내나요?'],
        ['Could you send me examples of the work you mentioned?', '말씀하신 과제 예시를 보내 주실 수 있을까요?']
      ]]
    ],
    steps: ['성적표·선생님 코멘트를 함께 읽고 궁금한 점 정리', '질문 5개를 영어 문장으로 준비', '선생님 역할 롤플레이로 실제처럼 연습', '상담 뒤 들은 내용을 정리하고 감사 메일까지'],
    faq: [['상담이 며칠 안 남았는데 도움이 될까요?', '네. 상담 날짜와 아이 학년·과목을 알려 주시면 그 상담에 필요한 표현과 질문만 집중해서 준비합니다.'], ['통역 없이 혼자 상담해도 괜찮을까요?', '미리 질문을 문장으로 써 가고, 못 알아들은 부분을 다시 묻는 표현(Could you say that again?)만 익혀도 훨씬 편해집니다.']]
  },
  {
    key: 'email', ico: '✉️', name: '담임·학교 이메일',
    title: '국제학교 담임 선생님 영어 이메일 — 결석·면담 요청·과제 문의 쓰는 법',
    h1: '담임·학교 이메일 영어',
    lead: '국제학교와의 연락은 대부분 이메일로 합니다. 길고 멋진 문장보다 인사 → 용건 → 요청 → 감사 순서로 짧고 분명하게 쓰는 것이 가장 좋습니다. 자주 쓰는 이메일을 직접 써 보고 첨삭받습니다.',
    sections: [
      ['결석·지각 알릴 때', [
        ['Dear Ms. Lee, I am writing to let you know that Minjun will be absent today because he has a fever.', '이 선생님께, 민준이가 열이 있어 오늘 결석한다는 것을 알려 드립니다.'],
        ['Could you please let me know if there is any work he should catch up on?', '밀린 과제가 있으면 알려 주실 수 있을까요?']
      ]],
      ['면담·문의할 때', [
        ['Would it be possible to schedule a short meeting next week?', '다음 주에 짧게 면담 일정을 잡을 수 있을까요?'],
        ['I have a quick question about the science project due on Friday.', '금요일 마감인 과학 프로젝트에 대해 간단히 여쭤볼 게 있습니다.'],
        ['Thank you for your time and support. Best regards, (이름)', '시간 내 주시고 도와주셔서 감사합니다. (이름) 드림']
      ]]
    ],
    steps: ['자주 보내는 이메일 종류 고르기(결석·면담·문의·감사)', '네 줄 구조로 직접 써 보기', '첨삭받고 더 자연스러운 표현으로 고치기', '내 상황에 맞는 이메일 틀(템플릿) 만들어 두기'],
    faq: [['이메일을 대신 써 주나요?', '대신 써 드리기보다 부모님이 직접 쓴 글을 함께 고칩니다. 몇 번 하면 비슷한 이메일은 혼자서도 금방 쓰실 수 있습니다.'], ['번역기를 써도 되지 않나요?', '번역기는 뜻은 전해도 어색하거나 너무 딱딱한 문장이 나오기 쉽습니다. 학교 이메일에 맞는 말투를 익혀 두면 번역기를 쓸 때도 고칠 곳이 보입니다.']]
  },
  {
    key: 'reading', ico: '📄', name: '성적표·학교 공지 읽기',
    title: '국제학교 성적표·뉴스레터 영어 읽기 — 꼭 봐야 할 부분 찾기',
    h1: '성적표·학교 공지 읽기',
    lead: '국제학교는 성적표 코멘트, 주간 뉴스레터, 행사 안내문이 모두 영어로 옵니다. 다 읽으려 하기보다 날짜·준비물·마감·아이에 대한 평가처럼 꼭 알아야 할 부분을 빠르게 찾는 연습을 합니다.',
    sections: [
      ['성적표에 자주 나오는 말', [
        ['Approaching expectations', '기준에 가까워지고 있음(아직 조금 부족)'],
        ['Demonstrates a strong understanding of key concepts.', '핵심 개념을 잘 이해하고 있습니다.'],
        ['Would benefit from reviewing feedback more carefully.', '피드백을 더 꼼꼼히 다시 보면 도움이 되겠습니다.']
      ]],
      ['공지·뉴스레터에서 찾을 것', [
        ['Please return the signed permission slip by Friday.', '서명한 참가 동의서를 금요일까지 제출해 주세요.'],
        ['Students should bring a packed lunch and a water bottle.', '학생은 도시락과 물병을 챙겨 와야 합니다.'],
        ['Early dismissal at 12:30 p.m. on Wednesday', '수요일 12시 30분 조기 하교']
      ]]
    ],
    steps: ['실제 받은 공지나 성적표(개인정보 가린 것)를 함께 읽기', '날짜·마감·준비물·요청 사항에 표시하는 습관 들이기', '성적표 코멘트를 우리말로 정리하고 궁금한 점 뽑기', '필요하면 선생님께 확인 메일 쓰기'],
    faq: [['실제 성적표를 보여 드려야 하나요?', '원하실 때만 이름 같은 개인정보를 가리고 보여 주시면 됩니다. 비슷한 예시 자료로도 충분히 연습할 수 있습니다.'], ['학교마다 성적표 형식이 다르지 않나요?', '네, IB·미국식·영국식에 따라 다릅니다. 아이 학교 형식에 맞춰 자주 나오는 표현부터 정리합니다.']]
  },
  {
    key: 'community', ico: '☕', name: '학부모 모임·행사',
    title: '국제학교 학부모 모임 영어 — 커피 모닝·학교 행사·플레이데이트 스몰토크',
    h1: '학부모 모임·행사 영어',
    lead: '커피 모닝, 학교 행사, 생일 파티, 플레이데이트 약속처럼 다른 학부모와 짧게 나누는 대화가 의외로 부담스럽습니다. 처음 인사부터 약속 잡기까지 자주 쓰는 대화를 상황별로 연습합니다.',
    sections: [
      ['처음 만났을 때', [
        ['Hi, I am Jiwoo\'s mom. Which class is your child in?', '안녕하세요, 지우 엄마예요. 아이가 어느 반이에요?'],
        ['We just moved here last month, so everything is still new to us.', '지난달에 이사 와서 아직 모든 게 새로워요.']
      ]],
      ['약속·부탁할 때', [
        ['Would your son like to come over for a playdate this weekend?', '이번 주말에 아드님이 우리 집에 놀러 올래요?'],
        ['Could you add me to the class parents\' group chat?', '반 학부모 단체 채팅방에 저도 넣어 주실 수 있을까요?'],
        ['I would be happy to help with the bake sale.', '베이크 세일 돕는 거라면 기꺼이 할게요.']
      ]]
    ],
    steps: ['자기소개를 30초 영어로 준비', '자주 나오는 질문에 짧게 답하는 연습', '약속 잡기·부탁하기 롤플레이', '행사 전에 그날 쓸 표현만 따로 점검'],
    faq: [['영어를 잘 못해서 모임에 나가기가 두려워요.', '긴 대화보다 인사와 질문 몇 개만 준비해도 충분합니다. 상대에게 질문을 던지는 표현을 익히면 대화가 자연스럽게 이어집니다.'], ['외국인 학부모 문화도 알려 주나요?', '모임에서 흔히 오가는 주제와 예의(초대 답장, 선물, 시간 약속 등)를 대화 연습과 함께 알려 드립니다.']]
  },
  {
    key: 'interview', ico: '🎤', name: '입학 인터뷰·학교 투어',
    title: '국제학교 입학 인터뷰 부모 영어 — 예상 질문과 학교 투어 질문 준비',
    h1: '입학 인터뷰·학교 투어 영어',
    lead: '입학 과정에서 부모님도 인터뷰를 하거나 학교 투어에서 질문할 기회가 있습니다. 학교마다 방식이 다르니 지원하는 학교 안내를 먼저 확인하고, 예상 질문에 대한 답과 학교에 물어볼 질문을 미리 준비합니다.',
    sections: [
      ['부모에게 자주 묻는 질문', [
        ['Why are you interested in our school?', '저희 학교에 관심을 가지신 이유는 무엇인가요?'],
        ['How would you describe your child?', '아이를 어떻게 소개하시겠어요?'],
        ['How do you support your child\'s learning at home?', '집에서는 아이의 학습을 어떻게 돕고 계신가요?']
      ]],
      ['투어에서 물어볼 질문', [
        ['What kind of English language support do you offer for new students?', '새로 온 학생에게 어떤 영어 지원(EAL)이 있나요?'],
        ['How do teachers communicate with parents?', '선생님과 학부모는 주로 어떻게 소통하나요?'],
        ['What after-school activities are available for this grade?', '이 학년이 할 수 있는 방과후 활동은 무엇이 있나요?']
      ]]
    ],
    steps: ['지원 학교의 입학 안내와 교육 방침 함께 읽기', '예상 질문 답변을 부모님 이야기로 정리', '실제 인터뷰처럼 질문을 주고받는 연습', '학교 투어 질문 리스트 만들기'],
    faq: [['아이 입학 준비도 같이 할 수 있나요?', '네. 국제학교튜터에서 아이의 입학·편입 준비(영어·수학·인터뷰)와 부모님 인터뷰 준비를 함께 상담할 수 있습니다.'], ['인터뷰 질문을 미리 알 수 있나요?', '학교가 실제 질문을 공개하지는 않습니다. 자주 나오는 유형으로 준비하고, 답변은 부모님의 실제 생각으로 만듭니다.']]
  },
  {
    key: 'relocation', ico: '✈️', name: '해외 발령 가족',
    title: '해외 발령 가족 영어 — 아이 국제학교 등록부터 현지 생활 영어까지',
    h1: '해외 발령 가족 영어',
    lead: '해외 발령이 정해지면 아이 학교 등록, 학교 상담, 병원, 집 계약, 이웃과의 대화까지 한꺼번에 영어가 필요해집니다. 출국 전 남은 기간에 맞춰 가장 먼저 쓰게 될 상황부터 순서대로 준비합니다.',
    sections: [
      ['학교 등록·첫 상담', [
        ['We are relocating from Korea in January. Is there a place available in Grade 5?', '1월에 한국에서 이주합니다. 5학년에 자리가 있을까요?'],
        ['What documents do we need to submit for enrollment?', '등록하려면 어떤 서류를 내야 하나요?']
      ]],
      ['현지 생활', [
        ['I would like to make an appointment for my daughter. She has had a cough for three days.', '딸 진료 예약을 하고 싶어요. 사흘째 기침을 해요.'],
        ['Could you tell me which day the garbage is collected?', '쓰레기 수거가 무슨 요일인지 알려 주실 수 있을까요?'],
        ['Nice to meet you. We just moved in next door.', '반갑습니다. 바로 옆집에 이사 왔어요.']
      ]]
    ],
    steps: ['출국 일정과 가족 상황 상담', '학교 등록·상담 영어부터 준비', '병원·집·은행 등 생활 영어 추가', '도착 후에도 화상 수업으로 이어서 연습'],
    faq: [['출국까지 시간이 얼마 없어요.', '남은 기간에 맞춰 꼭 필요한 상황(학교 등록·첫 상담)부터 순서를 정해 준비합니다.'], ['현지에 가서도 수업할 수 있나요?', '네. 모든 수업은 실시간 1:1 화상이라 도착 후에도 시차에 맞춰 같은 선생님과 이어서 수업할 수 있습니다. 아이 과목 과외도 함께 상담할 수 있습니다.']]
  }
];
