"""네이버 블로그 초안 → 텔레그램 (2026-11-09)
- 매일 13:00 KST 클라우드 루틴이 4가지 주제(국제학교·중고등 과외·자판기·영어회화)를 돌아가며 sns/blog/날짜.md 를 써서 올리면(.github/workflows/blog-telegram.yml) 이 스크립트가
  그 초안과 그날 카드뉴스 이미지를 텔레그램 "방문알림" 방으로 보낸다. 사용자가 네이버 블로그 앱에 붙여 넣어 올린다.
- 초안 형식: 첫 줄 '# 제목', 본문, 마지막 줄 '태그: a, b, c'. 본문의 [카드 N] 자리는 N번 카드 이미지를 넣을 곳.
- 네이버는 블로그 자동 글쓰기 공식 기능이 없고 매크로는 저품질 위험이 있어, 올리기는 사람이 한다."""
import glob, json, os, re, sys, urllib.parse, urllib.request

TG = os.environ['TG_TOKEN']
CHAT = os.environ.get('TG_CHAT') or '-5447586522'   # 'SNS 콘텐츠' 방(상담·방문 알림 방과 따로, 2026-11-10). 없으면 방문알림 방
SITE = 'https://internationalschool.kr'

files = sorted(glob.glob('sns/blog/*.md'))
if not files:
    sys.exit('초안 없음')
path = os.environ.get('BLOG_FILE') or files[-1]
day = os.path.basename(path)[:10]
text = open(path, encoding='utf-8').read().strip()
title = re.match(r'#\s*(.+)', text).group(1).strip()
body = re.sub(r'^#.*\n', '', text, count=1).strip()
# 제목 다음 줄 '카테고리: …' 는 올릴 블로그 카테고리 — 본문에서 빼고 안내 메시지에만 쓴다 (2026-11-11)
category = ''
if body.splitlines()[0].startswith('카테고리:'):
    category = body.splitlines()[0].split(':', 1)[1].strip()
    body = '\n'.join(body.splitlines()[1:]).strip()
tags = ''
if body.splitlines()[-1].startswith('태그:'):
    tags = body.splitlines()[-1]
    body = '\n'.join(body.splitlines()[:-1]).strip()

# 국제학교 외 주제는 카드뉴스가 없으니 글 내용으로 카드 이미지를 만든다(sns/blog_cards.py)
own_cards = []
if '[카드 1]' not in body:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import blog_cards
    body, own_cards = blog_cards.make(title, body, 'out/blog_cards')
if tags:
    body += '\n\n' + tags


def tg(method, params):
    data = urllib.parse.urlencode(params).encode()
    with urllib.request.urlopen(f'https://api.telegram.org/bot{TG}/{method}', data, timeout=60) as r:
        return json.loads(r.read())


# 자판기 글(sns/blog_vending)은 따로 만든 자판기 블로그에 올린다 (2026-11-13)
which = '🥤 [자판기 블로그]' if 'blog_vending' in path else '📚 [공부 길잡이 블로그]'
tg('sendMessage', {'chat_id': CHAT, 'text': f'{which} 📝 오늘의 네이버 블로그 글 — {title}\n' + (f'📂 카테고리: {category}\n' if category else '') +
   '① 아래 카드 이미지 저장 → ② 블로그 앱 글쓰기(위 카테고리 선택) → ③ 제목·본문 붙여넣기, [카드 N] 자리에 N번째 사진 넣기 → ④ 태그 넣고 발행'})
tg('sendMessage', {'chat_id': CHAT, 'text': title})
# 텔레그램 한 메시지는 4096자까지 — 문단 단위로 나눠 보낸다
chunk = ''
for para in body.split('\n\n'):
    if len(chunk) + len(para) + 2 > 3800:
        tg('sendMessage', {'chat_id': CHAT, 'text': chunk.strip()})
        chunk = ''
    chunk += para + '\n\n'
if chunk.strip():
    tg('sendMessage', {'chat_id': CHAT, 'text': chunk.strip()})

if own_cards:   # 직접 만든 카드 — 파일을 올려 보낸다(multipart)
    b = '----blogcards'
    media, parts = [], []
    for k, p in enumerate(own_cards, 1):
        media.append({'type': 'photo', 'media': f'attach://c{k}', **({'caption': f'카드 1~{len(own_cards)} (순서대로)'} if k == 1 else {})})
        parts.append(f'--{b}\r\nContent-Disposition: form-data; name="c{k}"; filename="{k}.jpg"\r\nContent-Type: image/jpeg\r\n\r\n'.encode()
                     + open(p, 'rb').read() + b'\r\n')
    head = (f'--{b}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n{CHAT}\r\n'
            f'--{b}\r\nContent-Disposition: form-data; name="media"\r\n\r\n{json.dumps(media)}\r\n').encode()
    req = urllib.request.Request(f'https://api.telegram.org/bot{TG}/sendMediaGroup', head + b''.join(parts) + f'--{b}--\r\n'.encode(),
                                 {'Content-Type': f'multipart/form-data; boundary={b}'})
    urllib.request.urlopen(req, timeout=120).read()
    print('직접 만든 카드', len(own_cards), '장 보냄')
    sys.exit(0)

# 그날 카드뉴스 이미지 (사이트 sns/cards/날짜/) — 국제학교 주제 날
try:
    info = json.loads(urllib.request.urlopen(f'{SITE}/sns/cards/{day}/info.json', timeout=30).read())
    media = [{'type': 'photo', 'media': f'{SITE}/sns/cards/{day}/{k}.jpg', **({'caption': f'카드 1~{info["cards"]} (순서대로)'} if k == 1 else {})}
             for k in range(1, min(info['cards'], 10) + 1)]
    tg('sendMediaGroup', {'chat_id': CHAT, 'media': json.dumps(media, ensure_ascii=False)})
except Exception as e:
    print('카드 이미지 안 보냄:', e)
print('보냄:', title)
