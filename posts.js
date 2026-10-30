/* 첫 글 — 사이트를 처음 만들 때 들어가는 글. 비워 두면 목록이 비어 보이니 2~3편은 직접 써서 넣는다.
   형식: { slug(영문-하이픈), date(YYYY-MM-DD), cat(분류), title, desc(80~150자), body(HTML 조각: p h2 h3 ul ol li b a table) }
   이후 글은 <출력>/<repo>/data/posts/{blog|admissions}/{slug}.json 에 JSON 으로 두고 새글.js 로 반영한다.
   ※ 2026-10-27 "[직접 쓰기]" 견본 글을 뺐다(실제 사이트에 견본이 올라가지 않게). 티쳐포유 글은 data/posts/blog/*.json */

const BLOG = [];

const ADMISSIONS = [];

module.exports = { BLOG, ADMISSIONS };
