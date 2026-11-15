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
# 티쳐포유 매일 글(sns/blog_teacher4u, 매일 15:10 루틴) — 2026-11-13
if 'blog_vending' in path:
    which = '🥤 [자판기 블로그]'
elif 'blog_teacher4u' in path:   # 2026-11-15: 티쳐포유 글도 공부 길잡이 블로그(같은 블로그)에 올린다 — 중고등 하위 카테고리
    which = '📚 [공부 길잡이 블로그 · 중고등 글]'
elif 'blog_maltuim' in path:   # 말트임 블로그 매일 14:10 루틴 (영어·중국어·일본어) — 2026-11-13
    which = '🗣 [말트임 블로그]'
else:
    which = '📚 [공부 길잡이 블로그]'

# 블로그별 정해진 카테고리 (2026-11-15 정리 — 바탕화면 '네이버블로그_카테고리_소개글.txt' 와 같게 유지)
# 초안 카테고리가 목록에 없으면(옛 이름·빠짐) 제목 낱말로 가장 가까운 것을 고르고 ⚠ 로 알린다.
CATS = {
    '🥤 [자판기 블로그]': {
        '🥤 자판기 고르기': r'기종|커피|스낵|음료|아이스크림|고르|추천',
        '📍 설치 장소별 이야기': r'설치|장소|사무실|학교|병원|헬스|호텔|공장|카페|아파트|매장',
        '🛠 운영·관리 팁': r'관리|운영|청소|재고|고장|전기|결제',
        '💰 무인창업·비용': r'창업|비용|수익|가격|렌탈|할부|부업',
        '❓ 자주 묻는 질문': r'\?|질문|궁금'},
    '📚 [공부 길잡이 블로그 · 중고등 글]': {
        '📚 중고등 내신·수능 > 📐 수학': r'수학|함수|미적|확통|기하',
        '📚 중고등 내신·수능 > 🔤 영어': r'영어|문법|독해|서술형',
        '📚 중고등 내신·수능 > 📖 국어·사회·과학': r'국어|문학|비문학|사회|역사|과학|물리|화학|생명|지구',
        '📚 중고등 내신·수능 > 🗓 시험 계획·공부법': r'계획|오답|플래너|습관|방학|복습|기말|중간고사',
        '📚 중고등 내신·수능 > 🎓 입시·학부모': r'입시|수시|정시|학점제|등급|학부모|과외|학원',
        '📚 중고등 내신·수능 > 🌏 외국어': r'중국어|일본어|HSK|JLPT|말하기|제2외국어'},
    '🗣 [말트임 블로그]': {
        '🗣 영어회화': r'영어|회화',
        '📝 영어 시험·면접': r'IELTS|TOEFL|OPIc|오픽|토익|스피킹|듀오링고|면접',
        '🇨🇳 중국어회화': r'중국어|HSK',
        '🇯🇵 일본어회화': r'일본어|JLPT'},
    '📚 [공부 길잡이 블로그]': {
        '🏫 국제학교': r'국제학교|IB|AP|IGCSE|A-Level',
        '✈️ 유학·캠프': r'유학|캠프|보딩',
        '📚 중고등 내신·수능': r'내신|수능|중학|고등|중[1-3]|고[1-3]|입시|학점제|과외|학원',
        '👩‍👧 국제학교 학부모 영어': r'학부모 영어|PTC|담임|이메일|상담 영어|스몰토크',
        '📢 공지·모집': r'모집|마감|신청 안내'},
}
cats = CATS[which]
warn = ''
# 하위 카테고리 이름만 적혀 있으면(예: '🗓 시험 계획·공부법') 상위를 붙인다
full = next((c for c in cats if category and c.endswith('> ' + category)), '')
if full:
    category = full
if category not in cats:
    # 더 구체적인 것부터 맞춰 본다(목록 뒤쪽이 더 좁은 주제인 경우가 많음)
    guess = next((c for c, kw in reversed(list(cats.items())) if re.search(kw, title)), list(cats)[0])
    warn = f'\n⚠ 초안에 적힌 카테고리 "{category or "없음"}" 는 목록에 없어 위처럼 바꿨어요'
    category = guess
tg('sendMessage', {'chat_id': CHAT, 'text': f'{which} 📝 오늘의 네이버 블로그 글 — {title}\n📂 카테고리: 【 {category} 】{warn}\n' +
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
    # 말트임 영어 글에는 신청 안내 랜딩 이미지 4장(sns/maltuim_landing)도 같이 — 글 맨 아래에 붙이는 용도
    if 'blog_maltuim' in path and not re.search(r'중국어|일본어|HSK|JLPT', title):
        lp = sorted(glob.glob('sns/maltuim_landing/*.png'))
        if lp:
            media, parts = [], []
            for k, p in enumerate(lp, 1):
                media.append({'type': 'photo', 'media': f'attach://l{k}', **({'caption': '말트임 신청 안내 이미지 4장 — 글 맨 아래(👉 신청 링크 위)에 순서대로 붙이세요'} if k == 1 else {})})
                parts.append(f'--{b}\r\nContent-Disposition: form-data; name="l{k}"; filename="l{k}.png"\r\nContent-Type: image/png\r\n\r\n'.encode()
                             + open(p, 'rb').read() + b'\r\n')
            head = (f'--{b}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n{CHAT}\r\n'
                    f'--{b}\r\nContent-Disposition: form-data; name="media"\r\n\r\n{json.dumps(media, ensure_ascii=False)}\r\n').encode()
            req = urllib.request.Request(f'https://api.telegram.org/bot{TG}/sendMediaGroup', head + b''.join(parts) + f'--{b}--\r\n'.encode(),
                                         {'Content-Type': f'multipart/form-data; boundary={b}'})
            urllib.request.urlopen(req, timeout=120).read()
            print('말트임 랜딩 이미지', len(lp), '장 보냄')
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
