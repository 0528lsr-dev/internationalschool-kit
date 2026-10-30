/* 국제학교 × 과목 과외 사이트 — 사이트별 설정
   - repo: 출력 폴더 이름(= GitHub 저장소 이름으로 쓰면 편하다)
   - domain: 연결할 도메인. CNAME 파일과 사이트 안 절대주소에 그대로 들어간다.
   - brand / en / slogan(2줄, 둘째 줄이 강조) / tagline("|" = PC 줄바꿈) : 홈 히어로 문구
   - profile: 'intl' (profiles.js · specialty.js)
   - sheetTab: 상담폼이 Apps Script 로 보낼 때 붙이는 시트 탭 이름 (보내는 주소는 run.js 의 HUB)
   - channelKey: 채널톡 플러그인 키(비어 있으면 채팅 버튼 없음) · kakao: 카카오 오픈채팅 주소(비어 있으면 버튼 없음)
   - gaId / naverWa / naverVerify / googleVerify: 구글 애널리틱스 · 네이버 애널리틱스 · 네이버/구글 소유확인 값. 비어 있으면 아무것도 안 넣는다.
   - theme: 색·글꼴·레이아웃 변형 (02_디자인_명세.md). hero/nav/home 조합이 사이트마다 다르면 "찍어낸 느낌"이 줄어든다.
   - home: 홈 섹션 순서 (curriculum|subjectsTiles|subjectsList|stats|regions|services|steps|teachers|faq|journal)
   - favicon: run.js faviconSvg 의 마크 이름 */

const TEL = '010-5577-3067';      // 상담 전화 (사이트 전체에 들어간다) — 티쳐포유와 같은 번호 사용 (2026-10-28 결정)
const TELRAW = '01055773067';     // tel: 링크용 숫자만

const SITES = [
  {
    /* 국제학교튜터 — internationalschool.kr (2026-10-28 브랜드·도메인 확정) */
    repo: "internationalschool", domain: "internationalschool.kr", brand: "국제학교튜터", en: "INTL SCHOOL TUTOR", profile: "intl",
    slogan: ["아이 학교의 커리큘럼으로,", "국제학교 1:1 과외"], tagline: "IB·AP·IGCSE·A-Level — 학교마다 다른 과정에 맞춰 수업합니다.|해외는 시차에 맞춘 화상 수업, 국내는 방문 수업도 가능합니다.",
    sheetTab: "국제학교", channelKey: "", kakao: "", gaId: "", naverWa: "", naverVerify: "308b7cbdc818430a177d9d011dbddc68e6b3e3ce", googleVerify: "TFvQgLhPTPvZXCuH4RrMWeH5_2rhiXK3ALJ6D9mDE18", favicon: "mark14",
    /* 밝음 · 버건디+로즈골드, 함렛 제목 — 기존 13곳·참고 사이트(나도 국제학교)와 색·히어로가 겹치지 않게 */
    theme: { mode: "light", bg: "#fbf7f5", surface: "#ffffff", surface2: "#f6ece8", ink: "#2a1a1f", primary: "#7a1f3d", onPrimary: "#ffffff",
             accent: "#c08a73", hl: "#b5654b", foot: "#2a1219", radius: "12px", head: "hahmlet", font: "pretendard", nav: "center", hero: "search", btn: "round" },
    home: ["curriculum", "subjectsList", "regions", "services", "steps", "faq", "journal"]
  }
];

/* 글꼴 — Google Fonts 또는 jsDelivr(Pretendard) */
const FONTS = {
  pretendard: { stack: '"Pretendard Variable",Pretendard,-apple-system,"Noto Sans KR",sans-serif', weight: 800, link: '' },
  noto:  { stack: '"Noto Sans KR",-apple-system,sans-serif', weight: 800, link: 'Noto+Sans+KR:wght@400;500;700;800' },
  gowun: { stack: '"Gowun Dodum","Noto Sans KR",sans-serif', weight: 700, link: 'Gowun+Dodum' },
  plex:  { stack: '"IBM Plex Sans KR","Noto Sans KR",sans-serif', weight: 700, link: 'IBM+Plex+Sans+KR:wght@400;500;600;700' },
  serif: { stack: '"Noto Serif KR","Nanum Myeongjo",serif', weight: 700, link: 'Noto+Serif+KR:wght@500;700;900' },
  gothica1: { stack: '"Gothic A1","Noto Sans KR",sans-serif', weight: 800, link: 'Gothic+A1:wght@400;500;700;800;900' },
  dohyeon:  { stack: '"Do Hyeon","Noto Sans KR",sans-serif', weight: 400, link: 'Do+Hyeon' },
  hahmlet:  { stack: 'Hahmlet,"Noto Serif KR",serif', weight: 700, link: 'Hahmlet:wght@400;600;700;800' },
  myeongjo: { stack: '"Nanum Myeongjo","Noto Serif KR",serif', weight: 800, link: 'Nanum+Myeongjo:wght@400;700;800' }
};

const { PROFILES } = require('./profiles');
for (const S of SITES) {
  S.siteUrl = 'https://' + S.domain;
  S.profile = S.profile || 'intl';
  S.levels = PROFILES[S.profile].levels;
  S.subjectsAll = PROFILES[S.profile].subjectsAll;
  /* tagline 의 "|" = PC 줄바꿈 자리. 화면에는 taglineLines(줄 나눔), 설명문·RSS 에는 tagline(한 줄) */
  S.taglineLines = S.tagline.split('|');
  S.tagline = S.taglineLines.join(' ');
  /* IndexNow 키 — 저장소 이름으로 정해지는 32자리(실행할 때마다 같아야 키 파일 주소가 안 바뀐다) */
  S.indexnowKey = require('crypto').createHash('md5').update('indexnow:' + S.repo).digest('hex');
}

module.exports = { SITES, FONTS, TEL, TELRAW };
