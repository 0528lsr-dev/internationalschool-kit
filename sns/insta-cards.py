"""국제학교튜터 → 인스타 카드뉴스(캐러셀) 자동 게시 (2026-11-09)
- GitHub Actions(.github/workflows/insta-cards.yml)가 매일 12:30 KST 에 실행한다.
- 사이트 rss.xml 에서 아직 인스타에 안 올린 글 중 '두 번째' 글을 고른다
  (첫 번째 글은 그날 저녁 릴스용 — insta-reel.py 가 가져간다).
- 표지 + 소제목(h2)별 카드(소제목 + 그 아래 내용 요약) + 마지막 안내 카드, 1080x1350 JPG.
- 인스타 API 는 사진을 공개 주소로만 받으므로, 카드를 사이트 저장소 sns/cards/날짜/ 에 올리고(GH_PAT)
  주소가 열리면 캐러셀로 게시한다.
- DRY=1 이면 카드만 만들고(out/cards/) 끝."""
import html, json, os, re, subprocess, sys, time, urllib.parse, urllib.request
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont
import io

TOKEN = os.environ.get('INSTA_TOKEN', '')
IG = '17841420958632232'          # intlschool_tutor
G = 'https://graph.facebook.com/v23.0'
SITE = 'https://internationalschool.kr'
DRY = os.environ.get('DRY') == '1'
OUT = 'out/cards'
W, H = 1080, 1350
import style                       # 날마다 색·배경·표지 문구·배치를 바꾼다 — 같은 날 릴스와도 다르게(offset 3)
S = style.pick(3)
P = S['pal']
WINE, ROSE, CREAM, INK, MUTE = P['dark'], P['accent'], P['light'], P['ink'], P['mute']
FONT = {k: f'out/Pretendard-{k}.otf' for k in ('Bold', 'ExtraBold', 'Medium')}


def get(url, data=None, headers=None):
    req = urllib.request.Request(url, data=data, headers=headers or {}, method='POST' if data is not None else 'GET')
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        raise SystemExit(f'{url.split("?")[0]} → {e.code} {e.read().decode()[:400]}')


def api(path, params=None, post=False):
    q = dict(params or {}, access_token=TOKEN)
    if post:
        return json.loads(get(f'{G}/{path}', urllib.parse.urlencode(q).encode()))
    return json.loads(get(f'{G}/{path}?{urllib.parse.urlencode(q)}'))


def tag(s, t):
    m = re.search(rf'<{t}>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?</{t}>', s)
    return html.unescape(m.group(1).strip()) if m else ''


def plain(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()


# 1. 글 고르기 -----------------------------------------------------------------
xml = get(f'{SITE}/rss.xml').decode()
items = [{'title': tag(m, 'title'), 'link': tag(m, 'link'), 'desc': tag(m, 'description'),
          'date': parsedate_to_datetime(tag(m, 'pubDate'))} for m in re.findall(r'<item>([\s\S]*?)</item>', xml)]
now = datetime.now(timezone.utc)
fresh = [i for i in reversed(items) if (now - i['date']).days < 3]
queue = fresh + [i for i in items if i not in fresh]
posted = ''
if TOKEN:
    posted = '\n'.join(x.get('caption', '') for x in api(f'{IG}/media', {'fields': 'caption', 'limit': 50}).get('data', []))
todo = [i for i in queue if i['title'] not in posted]
if len(todo) < 2:
    print('올릴 글 없음(남은 글은 릴스용)')
    sys.exit(0)
nxt = todo[1]
page = get(nxt['link']).decode()

# 소제목마다: 그 아래 목록/표/문단에서 요점 2~3개
body = re.split(r'<h2[^>]*>', page)[1:]
points = []
for sec in body:
    head = plain(sec.split('</h2>')[0])
    head = re.sub(r'^\d+[.)]\s*', '', head)
    if not head or re.search(r'다른 글|관련 글|함께 읽|목차', head):
        continue
    sec = sec.split('</h2>', 1)[1]
    lis = [plain(x) for x in re.findall(r'<li[^>]*>([\s\S]*?)</li>', sec)]
    rows = [' — '.join(plain(c) for c in re.findall(r'<td[^>]*>([\s\S]*?)</td>', r)) for r in re.findall(r'<tr>([\s\S]*?)</tr>', sec)]
    rows = [r for r in rows if r]
    paras = [plain(x) for x in re.findall(r'<p[^>]*>([\s\S]*?)</p>', sec)]
    if lis:
        lines = lis[:3]
    elif rows:
        lines = rows[:3]
    else:
        sents = re.split(r'(?<=[.!?다요])\s+', ' '.join(paras))
        lines, n = [], 0
        for s in sents:
            if n + len(s) > 150 or len(lines) >= 2:
                break
            lines.append(s)
            n += len(s)
    lines = [l if len(l) <= 70 else l[:68] + '…' for l in lines if l]
    points.append((head, lines))
points = points[:5]
print('글:', nxt['title'], [p[0] for p in points])

# 2. 카드 그리기 ---------------------------------------------------------------
os.makedirs(OUT, exist_ok=True)
for k, path in FONT.items():
    if not os.path.exists(path):
        open(path, 'wb').write(get(f'https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-{k}.otf'))
font = lambda k, size: ImageFont.truetype(FONT[k], size)


def wrap(d, text, f, width):
    lines, cur = [], ''
    for word in text.split(' '):
        t = (cur + ' ' + word).strip()
        if d.textlength(t, font=f) <= width:
            cur = t
            continue
        if cur:
            lines.append(cur)
        cur = ''
        for ch in word:
            if d.textlength(cur + ch, font=f) > width:
                lines.append(cur)
                cur = ''
            cur += ch
    if cur:
        lines.append(cur)
    return lines


def block(d, text, f, y, width, fill, x=None, gap=1.32):
    for ln in wrap(d, text, f, width):
        d.text(((W - d.textlength(ln, font=f)) / 2 if x is None else x, y), ln, font=f, fill=fill)
        y += int(f.size * gap)
    return y


def foot(d, fill, page=''):
    f = font('Bold', 30)
    d.text((80, H - 80), '국제학교튜터', font=f, fill=fill)
    if page:
        d.text((W - 80 - d.textlength(page, font=f), H - 80), page, font=f, fill=fill)


total = len(points) + 2
cards = []
photo = Image.open(S['bg']).convert('RGB')
r = max(W / photo.width, H / photo.height)
photo = photo.resize((int(photo.width * r) + 1, int(photo.height * r) + 1))
photo = photo.crop(((photo.width - W) // 2, (photo.height - H) // 2, (photo.width - W) // 2 + W, (photo.height - H) // 2 + H))
im = ImageEnhance.Brightness(photo.filter(ImageFilter.GaussianBlur(2))).enhance(0.40)
d = ImageDraw.Draw(im)
f = font('Bold', 40)
t = S['chip']
d.rounded_rectangle((W / 2 - d.textlength(t, font=f) / 2 - 45, 380, W / 2 + d.textlength(t, font=f) / 2 + 45, 452), 36, fill=ROSE)
d.text(((W - d.textlength(t, font=f)) / 2, 393), t, font=f, fill='white')
block(d, nxt['title'], font('ExtraBold', 80), 510, W - 160, 'white')
f = font('Bold', 36)
t = '옆으로 넘겨 보세요  →'
d.text(((W - d.textlength(t, font=f)) / 2, H - 230), t, font=f, fill=P['soft'])
if S['credit']:
    f = font('Medium', 22)
    d.text((W - d.textlength(S['credit'], font=f) - 30, H - 40), S['credit'], font=f, fill=(210, 210, 210))
foot(d, P['soft'])
cards.append(im)

for n, (head, lines) in enumerate(points, 1):
    im = Image.new('RGB', (W, H), CREAM)
    d = ImageDraw.Draw(im)
    if S['layout'] == 0:      # 위 띠 + 큰 번호
        d.rectangle((0, 0, W, 16), fill=WINE)
        d.text((80, 120), f'{n:02d}', font=font('ExtraBold', 150), fill=ROSE)
    else:                     # 왼쪽 세로 띠 + 동그라미 번호
        d.rectangle((0, 0, 16, H), fill=ROSE)
        d.ellipse((80, 140, 250, 310), fill=WINE)
        f = font('ExtraBold', 84)
        d.text((165 - d.textlength(f'{n:02d}', font=f) / 2, 175), f'{n:02d}', font=f, fill='white')
    y = block(d, head, font('ExtraBold', 66), 360, W - 160, INK, x=80)
    d.rectangle((80, y + 30, 200, y + 38), fill=WINE)
    y += 90
    fb = font('Medium', 40)
    for ln in lines:
        d.ellipse((84, y + 18, 100, y + 34), fill=ROSE)
        y = block(d, ln, fb, y, W - 220, MUTE, x=124, gap=1.45) + 26
    foot(d, WINE, f'{n + 1} / {total}')
    cards.append(im)

im = Image.new('RGB', (W, H), WINE)
d = ImageDraw.Draw(im)
y = block(d, '국제학교 1:1 화상 과외', font('ExtraBold', 80), 380, W - 160, 'white')
y = block(d, 'IB · AP · IGCSE · A-Level', font('Bold', 46), y + 24, W - 160, P['soft'])
d.rounded_rectangle((120, y + 70, W - 120, y + 210), 70, fill=CREAM)
f = font('ExtraBold', 52)
t = '10~15분 무료 테스트 수업'
d.text(((W - d.textlength(t, font=f)) / 2, y + 108), t, font=f, fill=WINE)
y = block(d, '프로필 링크에서 신청하세요', font('Bold', 44), y + 270, W - 160, 'white')
block(d, '저장해 두고 필요할 때 다시 보세요', font('Medium', 36), y + 20, W - 160, P['soft'])
foot(d, P['soft'], f'{total} / {total}')
cards.append(im)

for k, c in enumerate(cards, 1):
    c.save(f'{OUT}/{k}.jpg', quality=90)
caption = '\n'.join([
    nxt['title'], '', nxt['desc'], '',
    *[f'✔ {h}' for h, _ in points], '',
    '📌 저장해 두고 필요할 때 다시 보세요',
    '💬 궁금한 점은 댓글로 남겨 주세요',
    '', '국제학교 1:1 화상 과외 · 10~15분 무료 테스트 수업',
    '👉 프로필 링크에서 신청 (@intlschool_tutor)', '',
    '#국제학교 #국제학교과외 #국제학교입학 #IB #AP #IGCSE #Alevel #송도국제학교 #제주국제학교 #화상과외 #국제학교맘 #카드뉴스'])
open(f'{OUT}/caption.txt', 'w').write(caption)
print('카드', len(cards), '장')
if DRY or not TOKEN:
    print('DRY — 올리지 않음')
    sys.exit(0)

# 3. 사이트 저장소에 올려 공개 주소 만들기 ---------------------------------------
day = (now + timedelta(hours=9)).strftime('%Y-%m-%d')
rel = f'sns/cards/{day}'
pat = os.environ['GH_PAT']
run = lambda *a, **k: subprocess.run(a, check=True, **k)
run('git', 'clone', '-q', '--depth', '1', f'https://x-access-token:{pat}@github.com/0528lsr-dev/internationalschool.git', 'site')
os.makedirs(f'site/{rel}', exist_ok=True)
for k in range(1, len(cards) + 1):
    run('cp', f'{OUT}/{k}.jpg', f'site/{rel}/{k}.jpg')
run('git', '-C', 'site', 'add', rel)
run('git', '-C', 'site', '-c', 'user.name=card-news-bot', '-c', 'user.email=actions@users.noreply.github.com', 'commit', '-qm', f'카드뉴스 이미지 {day}')
for _ in range(3):
    if subprocess.run(['git', '-C', 'site', 'push', '-q']).returncode == 0:
        break
    run('git', '-C', 'site', 'pull', '-q', '--rebase')
urls = [f'{SITE}/{rel}/{k}.jpg' for k in range(1, len(cards) + 1)]
for _ in range(40):           # GitHub Pages 반영 기다리기 (최대 약 10분)
    try:
        urllib.request.urlopen(urllib.request.Request(urls[-1], method='HEAD'), timeout=20)
        break
    except Exception:
        time.sleep(15)
else:
    raise SystemExit('카드 이미지 주소가 열리지 않음: ' + urls[-1])

# 4. 캐러셀 게시 ---------------------------------------------------------------
kids = [api(f'{IG}/media', {'image_url': u, 'is_carousel_item': 'true'}, post=True)['id'] for u in urls]
c = api(f'{IG}/media', {'media_type': 'CAROUSEL', 'children': ','.join(kids), 'caption': caption}, post=True)
for _ in range(30):
    if api(c['id'], {'fields': 'status_code'}).get('status_code') == 'FINISHED':
        break
    time.sleep(5)
p = api(f'{IG}/media_publish', {'creation_id': c['id']}, post=True)
print('게시 완료:', nxt['title'], api(p['id'], {'fields': 'permalink'}).get('permalink', ''))
