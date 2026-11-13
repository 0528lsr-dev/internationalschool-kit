/* 티쳐포유 → 스레드 자동 게시 (2026-11-13, 국제학교튜터 threads-post.mjs 복제)
   - GitHub Actions(.github/workflows/threads-t4u.yml)를 scheduler.yml 이 하루 세 번(09:07·15:07·21:37 KST) 실행한다.
   - 토큰은 비밀값 THREADS_TOKEN_T4U. 아직 없으면 오류 없이 건너뛴다.
   - 사이트 rss.xml 에서 아직 스레드에 안 올린 글 1편(새 글 먼저, 없으면 지난 글)을 골라 올린다.
     (올렸는지는 내 스레드 최근 게시물에 그 글 제목이 있는지로 판단 — 따로 기록 파일 없음)
   - 토큰(THREADS_TOKEN)은 60일짜리라 매번 갱신해서 $RUNNER_TEMP/new_token 에 써 두면 워크플로가 저장한다. */
import fs from 'node:fs';
import path from 'node:path';

const TOKEN = process.env.THREADS_TOKEN;
const RSS = 'https://teacher4u.co.kr/rss.xml';
const API = 'https://graph.threads.net/v1.0';
const DAYS = 3;
if (!TOKEN) { console.log('THREADS_TOKEN_T4U 가 아직 없어 건너뜀'); process.exit(0); }

const api = async (p, opt = {}) => {
  const r = await fetch(API + p, { ...opt, headers: { Authorization: 'Bearer ' + TOKEN } });
  const j = await r.json();
  if (j.error) throw new Error(p.split('?')[0] + ': ' + j.error.message);
  return j;
};
const unx = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/* 1. 사이트 최근 글 */
const xml = await (await fetch(RSS)).text();
const tag = (s, t) => { const m = s.match(new RegExp('<' + t + '>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</' + t + '>')); return m ? unx(m[1].trim()) : ''; };
const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
  .map(m => ({ title: tag(m[1], 'title'), link: tag(m[1], 'link'), desc: tag(m[1], 'description'), date: new Date(tag(m[1], 'pubDate')) }))
  .filter(i => i.link);
/* 최근 3일 새 글(오래된 것부터) 먼저, 없으면 지난 글(최신부터)을 하나 꺼내 올린다 */
const fresh = items.filter(i => Date.now() - i.date < DAYS * 864e5).reverse();
const queue = [...fresh, ...items.filter(i => !fresh.includes(i))];

/* 2. 이미 올린 글 빼기 (본문에 글 제목이 있으면 올린 것) */
const mine = await api('/me/threads?fields=text&limit=60');
const posted = (mine.data || []).map(x => x.text || '').join('\n');
const next = queue.find(i => !posted.includes(i.title));

/* 만들기 → 30초 기다렸다 게시 (Threads API 권장) */
const publish = async (text, replyTo) => {
  const q = { media_type: 'TEXT', text };
  if (replyTo) q.reply_to_id = replyTo;
  const c = await api('/me/threads?' + new URLSearchParams(q), { method: 'POST' });
  await new Promise(r => setTimeout(r, 30000));
  return (await api('/me/threads_publish?' + new URLSearchParams({ creation_id: c.id }), { method: 'POST' })).id;
};

if (!next) console.log('올릴 글 없음');
else {
  /* 3. 스레드는 링크 글보다 본문만으로 읽히는 글이 더 퍼진다 — 본문엔 요점만, 링크는 내 댓글로 (2026-11-09) */
  let heads = [];
  try {
    const html = await (await fetch(next.link)).text();
    heads = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map(m => unx(m[1]).replace(/^\d+[.)]\s*/, '').trim())
      .filter(h => h && !/다른 글|관련 글|함께 읽|목차/.test(h)).slice(0, 5);
  } catch (e) {}
  let desc = next.desc;
  const list = heads.length ? '\n\n' + heads.map(h => '✔ ' + h).join('\n') : '';
  const ask = '\n\n중·고등 학부모님, 궁금한 점은 댓글로 남겨 주세요 🙌\n#내신대비';
  const room = 490 - next.title.length - list.length - ask.length - 2;
  if (desc.length > room) desc = desc.slice(0, Math.max(0, room - 1)) + '…';
  const id = await publish(`${next.title}\n\n${desc}${list}${ask}`);
  console.log('게시 완료:', next.title, id);
  const reply = `👉 전체 글 보기\n${next.link}?utm_source=threads\n\n중·고등 1:1 과외 · 상담 + 첫 테스트 수업 30분 무료\nhttps://teacher4u.co.kr/contact.html?utm_source=threads`;
  try { console.log('링크 댓글:', await publish(reply, id)); } catch (e) { console.log('링크 댓글 실패:', e.message); }
}

/* 4. 토큰 갱신 (발급 24시간 안이면 실패하는데, 그건 괜찮다) */
try {
  const r = await (await fetch('https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=' + TOKEN)).json();
  if (r.access_token && process.env.RUNNER_TEMP) {
    fs.writeFileSync(path.join(process.env.RUNNER_TEMP, 'new_token'), r.access_token);
    console.log('토큰 갱신: ' + Math.round(r.expires_in / 86400) + '일');
  } else console.log('토큰 갱신 건너뜀:', r.error ? r.error.message : '');
} catch (e) { console.log('토큰 갱신 실패:', e.message); }
