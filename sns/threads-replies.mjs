/* 국제학교튜터 스레드 — 우리 글에 새 댓글이 달리면 텔레그램 "방문알림" 방으로 알림 (2026-11-09)
   - GitHub Actions(.github/workflows/threads-replies.yml)가 1시간마다 실행한다.
   - 최근 70분 안에 달린 남의 댓글만 보낸다(기록 파일 없음 — 실행이 늦어지면 가끔 두 번 올 수 있다).
   - 텔레그램은 방문 알림과 같은 Apps Script 웹 앱으로 보낸다(그쪽 코드는 그대로, 방문 알림 칸에 댓글 내용을 넣는다). */
const TOKEN = process.env.THREADS_TOKEN;
const API = 'https://graph.threads.net/v1.0';
const HOOK = 'https://script.google.com/macros/s/AKfycbzpQIZERcfJP0aKF15sZFpIo0-HPvARnnyhlaORN0PCk1bf8j5F0Q5fHRZZ7rkABi5E/exec';
const WINDOW = 70 * 60 * 1000;
if (!TOKEN) throw new Error('THREADS_TOKEN 이 없습니다');

const api = async p => {
  const j = await (await fetch(API + p, { headers: { Authorization: 'Bearer ' + TOKEN } })).json();
  if (j.error) throw new Error(p.split('?')[0] + ': ' + j.error.message);
  return j;
};

const posts = (await api('/me/threads?fields=id,text,permalink&limit=25')).data || [];
const mineIds = new Set(((await api('/me/replies?fields=id&limit=100')).data || []).map(x => x.id));
let sent = 0;
for (const p of posts) {
  let conv = [];
  try { conv = (await api(`/${p.id}/conversation?fields=id,text,username,timestamp,permalink&limit=50`)).data || []; } catch (e) { continue; }
  for (const c of conv) {
    if (mineIds.has(c.id) || !c.timestamp || Date.now() - new Date(c.timestamp) > WINDOW) continue;
    const topic = (p.text || '').split('\n')[0].slice(0, 40);
    await fetch(HOOK, { method: 'POST', body: new URLSearchParams({
      site: '💬 스레드 새 댓글', kind: 'visit',
      title: (c.text || '(사진·내용 없음)').slice(0, 300),
      path: c.permalink || p.permalink || '',
      ref: '글: ' + topic, dev: c.username ? '@' + c.username : '', geo: '답글은 Claude 에게 붙여 넣으면 초안 작성'
    }) });
    sent++;
  }
}
console.log('새 댓글 알림:', sent);
