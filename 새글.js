/* 데일리 글 반영 — 저장소의 data/posts/{blog|admissions}/*.json 을 읽어
   글 페이지·글 목록(blog.html·admissions.html)·홈·RSS·sitemap-main.xml 만 다시 쓴다 (5만 장 학교 페이지는 안 건드림, 10초 안팎).
   실행(저장소 이름 하나):
     node 새글.js example   (node 가 없으면 03_생성기_사용법.md 의 VS Code 내장 node 방법)
   PowerShell:
   마지막 줄 "바뀐 파일: …" 이 git add 할 목록이다. */
const repo = process.argv[2];
const { SITES } = require('./sites');
if (!repo || !SITES.some(S => S.repo === repo)) {
  console.log('사용법: 새글.js <저장소 이름>   (' + SITES.map(S => S.repo).join(' / ') + ')');
  process.exit(1);
}
process.env.POSTS_ONLY = '1';
process.env.ONLY = repo;
process.argv = process.argv.slice(0, 2);   // run.js 는 argv[2] 를 출력 폴더로 쓰므로 비운다
require('./run.js');
