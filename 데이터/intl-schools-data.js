/* 국제학교 목록 — 국제학교 과외 생성기용 (2026-10-27 새로 정리)
   n  : 한글 이름(본문 첫 문장에 쓰는 정식 이름)
   e  : 영문 이름(약자 포함)
   sn : 검색 이름(제목·주소에 쓴다. 학부모가 실제로 부르는 이름 — 겹치지 않게)
   r  : "묶음 도시" — 국내는 "시도 지역", 해외는 "나라 도시". 도시와 나라가 같으면(싱가포르·홍콩) 같은 말을 두 번 쓴다
   c  : 커리큘럼(화면 표시용). 생성기가 이 글자로 IB / 미국식 / 영국식을 가려 과목 문구를 바꾼다
   t  : 국내 / 해외
   ※ 학비·정원·입학 일정 같은 바뀌는 숫자는 넣지 않는다. 커리큘럼은 학교 공식 사이트 기준으로 확인하고 고친다.
   ※ 발행 뒤에는 sn(주소)을 바꾸지 않는다. */
window.INTL_SCHOOLS = [
  /* ===== 국내 — 제주영어교육도시 ===== */
  {n:"NLCS 제주", e:"North London Collegiate School Jeju", sn:"NLCS제주", r:"제주 영어교육도시", c:"영국식·IGCSE·IB", t:"국내"},
  {n:"브랭섬홀 아시아", e:"Branksome Hall Asia (BHA)", sn:"브랭섬홀아시아", r:"제주 영어교육도시", c:"IB", t:"국내"},
  {n:"한국국제학교 제주", e:"Korea International School Jeju (KIS Jeju)", sn:"KIS제주", r:"제주 영어교육도시", c:"미국식·AP", t:"국내"},
  {n:"세인트존스베리 아카데미 제주", e:"St. Johnsbury Academy Jeju (SJA)", sn:"SJA제주", r:"제주 영어교육도시", c:"미국식·AP", t:"국내"},

  /* ===== 국내 — 인천 ===== */
  {n:"채드윅 송도국제학교", e:"Chadwick International", sn:"채드윅송도", r:"인천 송도", c:"IB", t:"국내"},
  {n:"청라달튼외국인학교", e:"Cheongna Dalton School", sn:"청라달튼", r:"인천 청라", c:"미국식·AP", t:"국내"},
  {n:"칼빈매니토바국제학교", e:"Calvin Manitoba International School (CMIS)", sn:"칼빈매니토바", r:"인천 송도", c:"캐나다식", t:"국내"},

  /* ===== 국내 — 서울 ===== */
  {n:"서울외국인학교", e:"Seoul Foreign School (SFS)", sn:"SFS", r:"서울 서대문", c:"영국식·IGCSE·IB", t:"국내"},
  {n:"한국외국인학교 서울캠퍼스", e:"Korea International School Seoul (KIS Seoul)", sn:"KIS서울", r:"서울 강남", c:"미국식·AP", t:"국내"},
  {n:"용산국제학교", e:"Yongsan International School of Seoul (YISS)", sn:"YISS", r:"서울 용산", c:"미국식·AP", t:"국내"},
  {n:"덜위치칼리지 서울", e:"Dulwich College Seoul", sn:"덜위치서울", r:"서울 서초", c:"영국식·IGCSE·IB", t:"국내"},
  {n:"드와이트 외국인학교", e:"Dwight School Seoul", sn:"드와이트서울", r:"서울 마포", c:"IB", t:"국내"},
  {n:"아시아퍼시픽국제외국인학교", e:"Asia Pacific International School (APIS)", sn:"APIS", r:"서울 노원", c:"미국식·AP", t:"국내"},
  {n:"한국켄트외국인학교", e:"Korea Kent Foreign School (KKFS)", sn:"켄트외국인학교", r:"서울 광진", c:"미국식·AP", t:"국내"},
  {n:"코리아외국인학교", e:"Korea Foreign School (KFS)", sn:"코리아외국인학교", r:"서울 서초", c:"영국식·IGCSE·IB", t:"국내"},
  {n:"지구촌기독외국인학교", e:"Global Christian Foreign School (GCFS)", sn:"GCFS", r:"서울 용산", c:"미국식·AP", t:"국내"},

  /* ===== 국내 — 경기 ===== */
  {n:"한국외국인학교 판교캠퍼스", e:"Korea International School Pangyo (KIS Pangyo)", sn:"KIS판교", r:"경기 성남", c:"미국식·AP", t:"국내"},
  {n:"서울국제학교", e:"Seoul International School (SIS)", sn:"SIS서울국제학교", r:"경기 성남", c:"미국식·AP", t:"국내"},
  {n:"경기수원외국인학교", e:"Gyeonggi Suwon International School (GSIS)", sn:"GSIS수원", r:"경기 수원", c:"IB", t:"국내"},
  {n:"국제크리스천학교 의정부", e:"International Christian School Uijeongbu (ICSU)", sn:"ICS의정부", r:"경기 의정부", c:"미국식·AP", t:"국내"},
  {n:"평택크리스천외국인학교", e:"International Christian School Pyeongtaek (ICSP)", sn:"ICS평택", r:"경기 평택", c:"미국식·AP", t:"국내"},

  /* ===== 국내 — 지방 ===== */
  {n:"부산외국인학교", e:"Busan Foreign School (BFS)", sn:"BFS부산", r:"부산 해운대", c:"미국식·AP", t:"국내"},
  {n:"부산국제외국인학교", e:"Busan International Foreign School (BIFS)", sn:"BIFS부산", r:"부산 기장", c:"IB", t:"국내"},
  {n:"대구국제학교", e:"Daegu International School (DIS)", sn:"DIS대구", r:"대구 동구", c:"미국식·AP", t:"국내"},
  {n:"대전외국인학교", e:"Taejon Christian International School (TCIS)", sn:"TCIS대전", r:"대전 유성", c:"미국식·AP·IB", t:"국내"},
  {n:"광주외국인학교", e:"Gwangju International School (GIS)", sn:"GIS광주", r:"광주 북구", c:"미국식·AP", t:"국내"},
  {n:"현대외국인학교", e:"Hyundai Foreign School (HFS)", sn:"현대외국인학교", r:"울산 동구", c:"영국식·IGCSE·IB", t:"국내"},
  {n:"경남국제외국인학교", e:"Gyeongnam International Foreign School (GIFS)", sn:"GIFS사천", r:"경남 사천", c:"IB", t:"국내"},
  {n:"애서튼국제외국인학교", e:"Atherton International School (AIS)", sn:"애서튼거제", r:"경남 거제", c:"영국식·IGCSE·A-Level", t:"국내"},

  /* ===== 싱가포르 ===== */
  {n:"UWCSEA 도버 캠퍼스", e:"United World College of South East Asia Dover", sn:"UWCSEA도버", r:"싱가포르 싱가포르", c:"IGCSE·IB", t:"해외"},
  {n:"UWCSEA 이스트 캠퍼스", e:"United World College of South East Asia East", sn:"UWCSEA이스트", r:"싱가포르 싱가포르", c:"IGCSE·IB", t:"해외"},
  {n:"싱가포르 아메리칸 스쿨", e:"Singapore American School (SAS)", sn:"SAS싱가포르", r:"싱가포르 싱가포르", c:"미국식·AP", t:"해외"},
  {n:"탱글린 트러스트 스쿨", e:"Tanglin Trust School", sn:"탱글린", r:"싱가포르 싱가포르", c:"영국식·IGCSE·A-Level·IB", t:"해외"},
  {n:"덜위치 칼리지 싱가포르", e:"Dulwich College Singapore", sn:"덜위치싱가포르", r:"싱가포르 싱가포르", c:"영국식·IGCSE·IB", t:"해외"},
  {n:"캐나디안 인터내셔널 스쿨 싱가포르", e:"Canadian International School Singapore (CIS)", sn:"CIS싱가포르", r:"싱가포르 싱가포르", c:"IB", t:"해외"},
  {n:"오스트레일리안 인터내셔널 스쿨 싱가포르", e:"Australian International School Singapore (AIS)", sn:"AIS싱가포르", r:"싱가포르 싱가포르", c:"IGCSE·IB", t:"해외"},
  {n:"스탬포드 아메리칸 인터내셔널 스쿨", e:"Stamford American International School (SAIS)", sn:"스탬포드아메리칸", r:"싱가포르 싱가포르", c:"미국식·AP·IB", t:"해외"},
  {n:"챗스워스 인터내셔널 스쿨", e:"Chatsworth International School", sn:"챗스워스", r:"싱가포르 싱가포르", c:"IB", t:"해외"},
  {n:"NLCS 싱가포르", e:"North London Collegiate School Singapore", sn:"NLCS싱가포르", r:"싱가포르 싱가포르", c:"IB", t:"해외"},
  {n:"오버시즈 패밀리 스쿨", e:"Overseas Family School (OFS)", sn:"OFS싱가포르", r:"싱가포르 싱가포르", c:"IGCSE·IB", t:"해외"},
  {n:"화중 인터내셔널 스쿨", e:"Hwa Chong International School", sn:"화중인터내셔널", r:"싱가포르 싱가포르", c:"IGCSE·IB", t:"해외"},

  /* ===== 홍콩 ===== */
  {n:"홍콩 국제학교", e:"Hong Kong International School (HKIS)", sn:"HKIS", r:"홍콩 홍콩", c:"미국식·AP", t:"해외"},
  {n:"차이니즈 인터내셔널 스쿨", e:"Chinese International School (CIS)", sn:"CIS홍콩", r:"홍콩 홍콩", c:"IB", t:"해외"},
  {n:"캐나디안 인터내셔널 스쿨 오브 홍콩", e:"Canadian International School of Hong Kong (CDNIS)", sn:"CDNIS", r:"홍콩 홍콩", c:"IB", t:"해외"},
  {n:"ESF 아일랜드 스쿨", e:"ESF Island School", sn:"아일랜드스쿨", r:"홍콩 홍콩", c:"IB", t:"해외"},
  {n:"ESF 킹조지5세 스쿨", e:"ESF King George V School (KGV)", sn:"KGV홍콩", r:"홍콩 홍콩", c:"IGCSE·IB", t:"해외"},
  {n:"ESF 웨스트아일랜드 스쿨", e:"ESF West Island School", sn:"웨스트아일랜드", r:"홍콩 홍콩", c:"IGCSE·IB", t:"해외"},
  {n:"ESF 사우스아일랜드 스쿨", e:"ESF South Island School", sn:"사우스아일랜드", r:"홍콩 홍콩", c:"IB", t:"해외"},
  {n:"해로 인터내셔널 스쿨 홍콩", e:"Harrow International School Hong Kong", sn:"해로홍콩", r:"홍콩 홍콩", c:"영국식·IGCSE·A-Level", t:"해외"},
  {n:"저먼스위스 인터내셔널 스쿨", e:"German Swiss International School (GSIS)", sn:"GSIS홍콩", r:"홍콩 홍콩", c:"IGCSE·IB", t:"해외"},

  /* ===== 중국 ===== */
  {n:"인터내셔널 스쿨 오브 베이징", e:"International School of Beijing (ISB)", sn:"ISB베이징", r:"중국 베이징", c:"IB", t:"해외"},
  {n:"덜위치 칼리지 베이징", e:"Dulwich College Beijing", sn:"덜위치베이징", r:"중국 베이징", c:"영국식·IGCSE·IB", t:"해외"},
  {n:"웨스턴 아카데미 오브 베이징", e:"Western Academy of Beijing (WAB)", sn:"WAB베이징", r:"중국 베이징", c:"IB", t:"해외"},
  {n:"베이징 시티 인터내셔널 스쿨", e:"Beijing City International School (BCIS)", sn:"BCIS베이징", r:"중국 베이징", c:"IB", t:"해외"},
  {n:"상하이 아메리칸 스쿨", e:"Shanghai American School (SAS)", sn:"SAS상하이", r:"중국 상하이", c:"미국식·AP·IB", t:"해외"},
  {n:"덜위치 칼리지 상하이 푸동", e:"Dulwich College Shanghai Pudong", sn:"덜위치상하이", r:"중국 상하이", c:"영국식·IGCSE·IB", t:"해외"},
  {n:"웰링턴 칼리지 인터내셔널 상하이", e:"Wellington College International Shanghai", sn:"웰링턴상하이", r:"중국 상하이", c:"영국식·IGCSE·IB", t:"해외"},
  {n:"상하이 커뮤니티 인터내셔널 스쿨", e:"Shanghai Community International School (SCIS)", sn:"SCIS상하이", r:"중국 상하이", c:"IB", t:"해외"},
  {n:"콩코디아 인터내셔널 스쿨 상하이", e:"Concordia International School Shanghai", sn:"콩코디아상하이", r:"중국 상하이", c:"미국식·AP", t:"해외"},
  {n:"YCIS 상하이", e:"Yew Chung International School of Shanghai", sn:"YCIS상하이", r:"중국 상하이", c:"IGCSE·IB", t:"해외"},
  {n:"광저우 아메리칸 인터내셔널 스쿨", e:"American International School of Guangzhou (AISG)", sn:"AISG광저우", r:"중국 광저우", c:"IB", t:"해외"},
  {n:"셔코우 인터내셔널 스쿨", e:"Shekou International School (SIS)", sn:"셔코우인터내셔널", r:"중국 선전", c:"IB", t:"해외"},
  {n:"덜위치 칼리지 쑤저우", e:"Dulwich College Suzhou", sn:"덜위치쑤저우", r:"중국 쑤저우", c:"영국식·IGCSE·IB", t:"해외"},
  {n:"쑤저우 싱가포르 인터내셔널 스쿨", e:"Suzhou Singapore International School (SSIS)", sn:"SSIS쑤저우", r:"중국 쑤저우", c:"IB", t:"해외"},

  /* ===== 일본 ===== */
  {n:"아메리칸 스쿨 인 재팬", e:"The American School in Japan (ASIJ)", sn:"ASIJ", r:"일본 도쿄", c:"미국식·AP", t:"해외"},
  {n:"브리티시 스쿨 인 도쿄", e:"The British School in Tokyo (BST)", sn:"BST도쿄", r:"일본 도쿄", c:"영국식·IGCSE·A-Level", t:"해외"},
  {n:"세인트메리 인터내셔널 스쿨", e:"St. Mary's International School", sn:"세인트메리도쿄", r:"일본 도쿄", c:"IB", t:"해외"},
  {n:"세이센 인터내셔널 스쿨", e:"Seisen International School", sn:"세이센", r:"일본 도쿄", c:"IB", t:"해외"},
  {n:"아오바 재팬 인터내셔널 스쿨", e:"Aoba-Japan International School", sn:"아오바재팬", r:"일본 도쿄", c:"IB", t:"해외"},
  {n:"K. 인터내셔널 스쿨 도쿄", e:"K. International School Tokyo (KIST)", sn:"KIST도쿄", r:"일본 도쿄", c:"IB", t:"해외"},
  {n:"요코하마 인터내셔널 스쿨", e:"Yokohama International School (YIS)", sn:"YIS요코하마", r:"일본 요코하마", c:"IB", t:"해외"},
  {n:"세인트모어 인터내셔널 스쿨", e:"Saint Maur International School", sn:"세인트모어", r:"일본 요코하마", c:"IGCSE·IB", t:"해외"},
  {n:"오사카 인터내셔널 스쿨", e:"Osaka International School (OIS)", sn:"OIS오사카", r:"일본 오사카", c:"IB", t:"해외"},
  {n:"캐나디안 아카데미", e:"Canadian Academy", sn:"캐나디안아카데미고베", r:"일본 고베", c:"미국식·IB", t:"해외"},

  /* ===== 대만 ===== */
  {n:"타이베이 아메리칸 스쿨", e:"Taipei American School (TAS)", sn:"TAS타이베이", r:"대만 타이베이", c:"미국식·AP", t:"해외"},
  {n:"타이베이 유럽학교", e:"Taipei European School (TES)", sn:"TES타이베이", r:"대만 타이베이", c:"영국식·IGCSE·IB", t:"해외"},

  /* ===== 베트남 ===== */
  {n:"사이공 사우스 인터내셔널 스쿨", e:"Saigon South International School (SSIS)", sn:"SSIS호치민", r:"베트남 호치민", c:"미국식·AP·IB", t:"해외"},
  {n:"ISHCMC 호치민 국제학교", e:"International School Ho Chi Minh City (ISHCMC)", sn:"ISHCMC", r:"베트남 호치민", c:"IB", t:"해외"},
  {n:"브리티시 인터내셔널 스쿨 호치민", e:"British International School Ho Chi Minh City (BIS HCMC)", sn:"BIS호치민", r:"베트남 호치민", c:"영국식·IGCSE·IB", t:"해외"},
  {n:"오스트레일리안 인터내셔널 스쿨 호치민", e:"Australian International School HCMC (AIS)", sn:"AIS호치민", r:"베트남 호치민", c:"IGCSE·IB", t:"해외"},
  {n:"UNIS 하노이", e:"United Nations International School of Hanoi (UNIS)", sn:"UNIS하노이", r:"베트남 하노이", c:"IB", t:"해외"},
  {n:"브리티시 인터내셔널 스쿨 하노이", e:"British International School Hanoi (BIS Hanoi)", sn:"BIS하노이", r:"베트남 하노이", c:"영국식·IGCSE·IB", t:"해외"},
  {n:"콩코디아 인터내셔널 스쿨 하노이", e:"Concordia International School Hanoi", sn:"콩코디아하노이", r:"베트남 하노이", c:"미국식·AP", t:"해외"},
  {n:"세인트폴 아메리칸 스쿨 하노이", e:"St. Paul American School Hanoi", sn:"세인트폴하노이", r:"베트남 하노이", c:"미국식·AP", t:"해외"},

  /* ===== 태국 ===== */
  {n:"인터내셔널 스쿨 방콕", e:"International School Bangkok (ISB)", sn:"ISB방콕", r:"태국 방콕", c:"미국식·AP·IB", t:"해외"},
  {n:"NIST 인터내셔널 스쿨", e:"NIST International School", sn:"NIST방콕", r:"태국 방콕", c:"IB", t:"해외"},
  {n:"해로 인터내셔널 스쿨 방콕", e:"Harrow International School Bangkok", sn:"해로방콕", r:"태국 방콕", c:"영국식·IGCSE·A-Level", t:"해외"},
  {n:"브리티시 스쿨 오브 방콕 파타나", e:"Bangkok Patana School", sn:"파타나방콕", r:"태국 방콕", c:"영국식·IGCSE·IB", t:"해외"},
  {n:"세인트앤드루스 인터내셔널 스쿨 방콕", e:"St Andrews International School Bangkok", sn:"세인트앤드루스방콕", r:"태국 방콕", c:"영국식·IGCSE·IB", t:"해외"},
  {n:"브라이튼 칼리지 방콕", e:"Brighton College Bangkok", sn:"브라이튼방콕", r:"태국 방콕", c:"영국식·IGCSE·A-Level", t:"해외"},
  {n:"KIS 인터내셔널 스쿨 방콕", e:"KIS International School Bangkok", sn:"KIS방콕", r:"태국 방콕", c:"IB", t:"해외"},
  {n:"루암루디 인터내셔널 스쿨", e:"Ruamrudee International School (RIS)", sn:"루암루디", r:"태국 방콕", c:"미국식·AP·IB", t:"해외"},

  /* ===== 말레이시아 ===== */
  {n:"인터내셔널 스쿨 오브 쿠알라룸푸르", e:"International School of Kuala Lumpur (ISKL)", sn:"ISKL", r:"말레이시아 쿠알라룸푸르", c:"미국식·IB", t:"해외"},
  {n:"앨리스 스미스 스쿨", e:"The Alice Smith School", sn:"앨리스스미스", r:"말레이시아 쿠알라룸푸르", c:"영국식·IGCSE·A-Level", t:"해외"},
  {n:"가든 인터내셔널 스쿨", e:"Garden International School (GIS)", sn:"가든인터내셔널", r:"말레이시아 쿠알라룸푸르", c:"영국식·IGCSE·A-Level", t:"해외"},
  {n:"몽키아라 인터내셔널 스쿨", e:"Mont'Kiara International School (M'KIS)", sn:"MKIS몽키아라", r:"말레이시아 쿠알라룸푸르", c:"미국식·IB", t:"해외"},
  {n:"말보로 칼리지 말레이시아", e:"Marlborough College Malaysia", sn:"말보로말레이시아", r:"말레이시아 조호르", c:"영국식·IGCSE·IB", t:"해외"},

  /* ===== 필리핀 · 인도네시아 · 인도 ===== */
  {n:"인터내셔널 스쿨 마닐라", e:"International School Manila (ISM)", sn:"ISM마닐라", r:"필리핀 마닐라", c:"미국식·IB", t:"해외"},
  {n:"브리티시 스쿨 마닐라", e:"The British School Manila (BSM)", sn:"BSM마닐라", r:"필리핀 마닐라", c:"영국식·IGCSE·IB", t:"해외"},
  {n:"브렌트 인터내셔널 스쿨 마닐라", e:"Brent International School Manila", sn:"브렌트마닐라", r:"필리핀 마닐라", c:"IB", t:"해외"},
  {n:"자카르타 인터컬추럴 스쿨", e:"Jakarta Intercultural School (JIS)", sn:"JIS자카르타", r:"인도네시아 자카르타", c:"미국식·AP·IB", t:"해외"},
  {n:"브리티시 스쿨 자카르타", e:"British School Jakarta (BSJ)", sn:"BSJ자카르타", r:"인도네시아 자카르타", c:"영국식·IGCSE·IB", t:"해외"},
  {n:"아메리칸 스쿨 오브 봄베이", e:"American School of Bombay (ASB)", sn:"ASB뭄바이", r:"인도 뭄바이", c:"미국식·IB", t:"해외"},

  /* ===== 중동 ===== */
  {n:"두바이 아메리칸 아카데미", e:"Dubai American Academy (DAA)", sn:"DAA두바이", r:"UAE 두바이", c:"미국식·IB", t:"해외"},
  {n:"GEMS 웰링턴 인터내셔널 스쿨", e:"GEMS Wellington International School", sn:"GEMS웰링턴", r:"UAE 두바이", c:"영국식·IGCSE·A-Level·IB", t:"해외"},
  {n:"두바이 칼리지", e:"Dubai College", sn:"두바이칼리지", r:"UAE 두바이", c:"영국식·IGCSE·A-Level", t:"해외"},
  {n:"주메이라 잉글리시 스피킹 스쿨", e:"Jumeirah English Speaking School (JESS)", sn:"JESS두바이", r:"UAE 두바이", c:"영국식·IGCSE·IB", t:"해외"},
  {n:"아메리칸 스쿨 오브 도하", e:"American School of Doha (ASD)", sn:"ASD도하", r:"카타르 도하", c:"미국식·AP·IB", t:"해외"},
  {n:"도하 칼리지", e:"Doha College", sn:"도하칼리지", r:"카타르 도하", c:"영국식·IGCSE·A-Level", t:"해외"},

  /* ===== 미국 보딩스쿨 ===== */
  {n:"필립스 엑시터 아카데미", e:"Phillips Exeter Academy", sn:"엑시터", r:"미국 뉴햄프셔", c:"미국식", t:"해외"},
  {n:"세인트폴스 스쿨", e:"St. Paul's School", sn:"세인트폴스쿨", r:"미국 뉴햄프셔", c:"미국식", t:"해외"},
  {n:"필립스 아카데미 앤도버", e:"Phillips Academy Andover", sn:"앤도버", r:"미국 매사추세츠", c:"미국식", t:"해외"},
  {n:"디어필드 아카데미", e:"Deerfield Academy", sn:"디어필드", r:"미국 매사추세츠", c:"미국식·AP", t:"해외"},
  {n:"그로튼 스쿨", e:"Groton School", sn:"그로튼", r:"미국 매사추세츠", c:"미국식", t:"해외"},
  {n:"밀턴 아카데미", e:"Milton Academy", sn:"밀턴아카데미", r:"미국 매사추세츠", c:"미국식", t:"해외"},
  {n:"미들섹스 스쿨", e:"Middlesex School", sn:"미들섹스", r:"미국 매사추세츠", c:"미국식", t:"해외"},
  {n:"초트 로즈메리 홀", e:"Choate Rosemary Hall", sn:"초트", r:"미국 코네티컷", c:"미국식·AP", t:"해외"},
  {n:"호치키스 스쿨", e:"The Hotchkiss School", sn:"호치키스", r:"미국 코네티컷", c:"미국식", t:"해외"},
  {n:"태프트 스쿨", e:"The Taft School", sn:"태프트", r:"미국 코네티컷", c:"미국식·AP", t:"해외"},
  {n:"루미스 채피 스쿨", e:"Loomis Chaffee School", sn:"루미스채피", r:"미국 코네티컷", c:"미국식·AP", t:"해외"},
  {n:"로렌스빌 스쿨", e:"The Lawrenceville School", sn:"로렌스빌", r:"미국 뉴저지", c:"미국식", t:"해외"},
  {n:"머서스버그 아카데미", e:"Mercersburg Academy", sn:"머서스버그", r:"미국 펜실베이니아", c:"미국식·AP", t:"해외"},
  {n:"더 힐 스쿨", e:"The Hill School", sn:"더힐스쿨", r:"미국 펜실베이니아", c:"미국식·AP", t:"해외"},
  {n:"대처 스쿨", e:"The Thacher School", sn:"대처스쿨", r:"미국 캘리포니아", c:"미국식", t:"해외"},
  {n:"케이트 스쿨", e:"Cate School", sn:"케이트스쿨", r:"미국 캘리포니아", c:"미국식", t:"해외"},

  /* ===== 캐나다 ===== */
  {n:"어퍼 캐나다 칼리지", e:"Upper Canada College (UCC)", sn:"UCC토론토", r:"캐나다 온타리오", c:"IB", t:"해외"},
  {n:"브랭섬홀 토론토", e:"Branksome Hall Toronto", sn:"브랭섬홀토론토", r:"캐나다 온타리오", c:"IB", t:"해외"},
  {n:"리들리 칼리지", e:"Ridley College", sn:"리들리칼리지", r:"캐나다 온타리오", c:"IB", t:"해외"},
  {n:"세인트앤드루스 칼리지", e:"St. Andrew's College", sn:"세인트앤드루스칼리지", r:"캐나다 온타리오", c:"캐나다식·AP", t:"해외"},
  {n:"브렌트우드 칼리지", e:"Brentwood College School", sn:"브렌트우드", r:"캐나다 브리티시컬럼비아", c:"캐나다식·AP", t:"해외"},
  {n:"쇼니건 레이크 스쿨", e:"Shawnigan Lake School", sn:"쇼니건레이크", r:"캐나다 브리티시컬럼비아", c:"캐나다식·AP", t:"해외"},

  /* ===== 영국 보딩스쿨 ===== */
  {n:"이튼 칼리지", e:"Eton College", sn:"이튼", r:"영국 버크셔", c:"영국식·GCSE·A-Level", t:"해외"},
  {n:"웰링턴 칼리지", e:"Wellington College", sn:"웰링턴칼리지", r:"영국 버크셔", c:"영국식·GCSE·A-Level·IB", t:"해외"},
  {n:"해로 스쿨", e:"Harrow School", sn:"해로스쿨", r:"영국 런던", c:"영국식·GCSE·A-Level", t:"해외"},
  {n:"웨스트민스터 스쿨", e:"Westminster School", sn:"웨스트민스터", r:"영국 런던", c:"영국식·GCSE·A-Level", t:"해외"},
  {n:"세븐오크스 스쿨", e:"Sevenoaks School", sn:"세븐오크스", r:"영국 켄트", c:"영국식·GCSE·IB", t:"해외"},
  {n:"위컴 애비", e:"Wycombe Abbey", sn:"위컴애비", r:"영국 버킹엄셔", c:"영국식·GCSE·A-Level", t:"해외"},
  {n:"첼트넘 레이디스 칼리지", e:"Cheltenham Ladies' College", sn:"첼트넘레이디스", r:"영국 글로스터셔", c:"영국식·GCSE·A-Level·IB", t:"해외"},
  {n:"럭비 스쿨", e:"Rugby School", sn:"럭비스쿨", r:"영국 워릭셔", c:"영국식·GCSE·A-Level", t:"해외"},
  {n:"오운들 스쿨", e:"Oundle School", sn:"오운들", r:"영국 노샘프턴셔", c:"영국식·GCSE·A-Level", t:"해외"},
  {n:"차터하우스", e:"Charterhouse", sn:"차터하우스", r:"영국 서리", c:"영국식·GCSE·A-Level·IB", t:"해외"},
  {n:"브라이튼 칼리지", e:"Brighton College", sn:"브라이튼칼리지", r:"영국 이스트서식스", c:"영국식·GCSE·A-Level", t:"해외"},

  /* ===== 스위스 ===== */
  {n:"르 로제", e:"Institut Le Rosey", sn:"르로제", r:"스위스 보", c:"IB", t:"해외"},
  {n:"에글롱 칼리지", e:"Aiglon College", sn:"에글롱", r:"스위스 보", c:"IGCSE·IB", t:"해외"},
  {n:"레장 아메리칸 스쿨", e:"Leysin American School (LAS)", sn:"레장아메리칸", r:"스위스 보", c:"미국식·IB", t:"해외"},
  {n:"콜레주 뒤 레만", e:"Collège du Léman", sn:"콜레주뒤레만", r:"스위스 제네바", c:"미국식·IB", t:"해외"},
  {n:"제네바 국제학교", e:"International School of Geneva (Ecolint)", sn:"에콜린트", r:"스위스 제네바", c:"IB", t:"해외"}
];
