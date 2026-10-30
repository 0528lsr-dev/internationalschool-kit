/* IndexNow 전송 — 사이트맵의 주소를 10,000개씩 묶어 api.indexnow.org 에 보낸다(네이버·빙 등 참여 엔진에 전달).
   실행: ELECTRON_RUN_AS_NODE=1 Code.exe indexnow.js [repo ...]   (인자 없으면 sites.js 전부)
   키 파일 {key}.txt 는 생성기가 저장소 루트에 둔다. HTTPS 가 켜진 뒤에 돌릴 것(주소가 https 로 기록되게). */
const fs = require('fs');
const path = require('path');
const { SITES } = require('./sites');
const HOME = path.join(__dirname, '출력');
const only = process.argv.slice(2);

async function post(S, urls) {
  const r = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: S.domain, key: S.indexnowKey, keyLocation: `${S.siteUrl}/${S.indexnowKey}.txt`, urlList: urls }) });
  return r.status;
}
(async () => {
  for (const S of SITES.filter(S => !only.length || only.includes(S.repo))) {
    const dir = path.join(HOME, S.repo);
    const urls = [];
    for (const f of ['sitemap-main.xml', 'sitemap-kr.xml', 'sitemap-abroad.xml', 'sitemap-teachers.xml']) {
      const xml = fs.readFileSync(path.join(dir, f), 'utf8');
      for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.push(m[1]);
    }
    const codes = [];
    for (let i = 0; i < urls.length; i += 10000) codes.push(await post(S, urls.slice(i, i + 10000)));
    console.log(`${S.repo.padEnd(12)} ${urls.length.toLocaleString()}개 → 응답 ${codes.join(',')}  (200/202=접수)`);
    fs.appendFileSync(path.join(__dirname, 'indexnow.log'), `${new Date().toISOString().slice(0, 16)} ${S.repo} ${urls.length} ${codes.join(',')}\n`);
  }
})();
