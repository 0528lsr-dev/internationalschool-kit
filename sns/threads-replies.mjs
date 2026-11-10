/* 국제학교튜터 스레드·인스타 — 우리 글에 새 댓글이 달리면 텔레그램으로 알림 (2026-11-09)
   - GitHub Actions(.github/workflows/threads-replies.yml)가 1시간마다 실행한다.
   - 최근 70분 안에 달린 남의 댓글만 보낸다(기록 파일 없음 — 실행이 늦어지면 가끔 두 번 올 수 있다).
   - 2026-11-10: 상담·방문 알림 방과 나눠 'SNS 콘텐츠' 방(TG_CHAT)으로 봇이 직접 보낸다.
     TG_TOKEN·TG_CHAT 이 없으면 예전처럼 방문 알림 Apps Script(방문알림 방)로 보낸다. */
const TOKEN = process.env.THREADS_TOKEN;
const API = 'https://graph.threads.net/v1.0';
const HOOK = 'https://script.google.com/macros/s/AKfycbzpQIZERcfJP0aKF15sZFpIo0-HPvARnnyhlaORN0PCk1bf8j5F0Q5fHRZZ7rkABi5E/exec';
const WINDOW = 70 * 60 * 1000;
if (!TOKEN) throw new Error('THREADS_TOKEN 이 없습니다');
const TG = process.env.TG_TOKEN, TG_CHAT = process.env.TG_CHAT;
const notify = async (where, text, link, about, who) => {
  if (TG && TG_CHAT) {
    const msg = `💬 ${where} 새 댓글${who ? ' — ' + who : ''}\n\n${text}\n\n📄 ${about}\n🔗 ${link}\n\n✍️ 답글은 이 댓글을 Claude 에게 붙여 넣으면 초안을 써 드려요`;
    await fetch(`https://api.telegram.org/bot${TG}/sendMessage`, { method: 'POST', body: new URLSearchParams({ chat_id: TG_CHAT, text: msg, disable_web_page_preview: 'true' }) });
  } else {
    await fetch(HOOK, { method: 'POST', body: new URLSearchParams({ site: `💬 ${where} 새 댓글`, kind: 'visit', title: text, path: link, ref: about, dev: who, geo: '답글은 Claude 에게 붙여 넣으면 초안 작성' }) });
  }
};

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
    await notify('스레드', (c.text || '(사진·내용 없음)').slice(0, 300), c.permalink || p.permalink || '', '글: ' + topic, c.username ? '@' + c.username : '');
    sent++;
  }
}
console.log('스레드 새 댓글 알림:', sent);

/* 인스타그램(intlschool_tutor) 새 댓글·대댓글도 같은 방으로 (2026-11-09) */
const IG_TOKEN = process.env.INSTA_TOKEN, IG = '17841420958632232', ME = 'intlschool_tutor';
if (IG_TOKEN) {
  const ig = async p => {
    const j = await (await fetch('https://graph.facebook.com/v23.0' + p, { headers: { Authorization: 'Bearer ' + IG_TOKEN } })).json();
    if (j.error) throw new Error(p.split('?')[0] + ': ' + j.error.message);
    return j;
  };
  let n = 0;
  const media = (await ig(`/${IG}/media?fields=id,caption,permalink&limit=20`)).data || [];
  for (const m of media) {
    let cs = [];
    try { cs = (await ig(`/${m.id}/comments?fields=id,text,username,timestamp,replies{id,text,username,timestamp}&limit=50`)).data || []; } catch (e) { continue; }
    for (const c of cs.flatMap(c => [c, ...((c.replies && c.replies.data) || [])])) {
      if (c.username === ME || !c.timestamp || Date.now() - new Date(c.timestamp) > WINDOW) continue;
      await notify('인스타', (c.text || '(내용 없음)').slice(0, 300), m.permalink || '', '게시물: ' + (m.caption || '').split('\n')[0].slice(0, 40), c.username ? '@' + c.username : '');
      n++;
    }
  }
  console.log('인스타 새 댓글 알림:', n);
}
