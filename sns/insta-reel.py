"""국제학교튜터 → 인스타 릴스 자동 게시 (2026-11-09)
- GitHub Actions(.github/workflows/insta-reels.yml)가 하루 한 번 실행한다.
- 사이트 rss.xml 에서 아직 인스타에 안 올린 글 1편(새 글 먼저, 없으면 지난 글)을 골라
  제목 + 소제목(h2) 요점으로 세로 영상(1080x1920, 약 18초, 무음)을 만들어 릴스로 올린다.
- 올렸는지는 내 인스타 최근 게시물 캡션에 그 글 제목이 있는지로 판단(기록 파일 없음).
- 토큰(INSTA_TOKEN)은 비즈니스 포트폴리오 시스템 사용자 토큰이라 만료되지 않는다.
- DRY=1 이면 영상만 만들고 올리지 않는다(out/reel.mp4)."""
import html, json, os, re, subprocess, sys, time, urllib.parse, urllib.request
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

TOKEN = os.environ.get('INSTA_TOKEN', '')
IG = '17841420958632232'          # intlschool_tutor
G = 'https://graph.facebook.com/v23.0'
SITE = 'https://internationalschool.kr'
DRY = os.environ.get('DRY') == '1'
OUT = 'out'
W, H = 1080, 1920
WINE, ROSE, CREAM, INK = (122, 31, 61), (192, 138, 115), (251, 247, 245), (42, 26, 31)
FONT = {k: f'{OUT}/Pretendard-{k}.otf' for k in ('Bold', 'ExtraBold', 'Medium')}


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


# 1. 올릴 글 고르기 ------------------------------------------------------------
xml = get(f'{SITE}/rss.xml').decode()
items = []
for m in re.finditer(r'<item>([\s\S]*?)</item>', xml):
    s = m.group(1)
    items.append({'title': tag(s, 'title'), 'link': tag(s, 'link'), 'desc': tag(s, 'description'),
                  'date': parsedate_to_datetime(tag(s, 'pubDate'))})
now = datetime.now(timezone.utc)
fresh = [i for i in reversed(items) if (now - i['date']).days < 3]
queue = fresh + [i for i in items if i not in fresh]

posted = ''
if TOKEN:
    posted = '\n'.join(x.get('caption', '') for x in api(f'{IG}/media', {'fields': 'caption', 'limit': 50}).get('data', []))
nxt = next((i for i in queue if i['title'] not in posted), None)
if not nxt:
    print('올릴 글 없음')
    sys.exit(0)
page = get(nxt['link']).decode()
heads = [re.sub(r'^\d+[.)]\s*', '', html.unescape(h)).strip() for h in re.findall(r'<h2[^>]*>([^<]+)</h2>', page)]
heads = [h for h in heads if h and not re.search(r'다른 글|관련 글|함께 읽|목차', h)][:5]
print('글:', nxt['title'], heads)

# 2. 장면 그리기 ---------------------------------------------------------------
os.makedirs(OUT, exist_ok=True)
for k, path in FONT.items():
    if not os.path.exists(path):
        open(path, 'wb').write(get(f'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-{k}.otf'))
font = lambda k, size: ImageFont.truetype(FONT[k], size)


def wrap(d, text, f, width):
    """한국어 줄바꿈 — 띄어쓰기 단위로 채우고, 한 단어가 너무 길면 글자 단위로 자른다."""
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


def block(d, text, f, y, width, fill, gap=1.28, center=True):
    for ln in wrap(d, text, f, width):
        x = (W - d.textlength(ln, font=f)) / 2 if center else 110
        d.text((x, y), ln, font=f, fill=fill)
        y += int(f.size * gap)
    return y


def brand(d, fill):
    f = font('Bold', 40)
    t = '국제학교튜터  ·  internationalschool.kr'
    d.text(((W - d.textlength(t, font=f)) / 2, H - 190), t, font=f, fill=fill)


photo = Image.open(__import__('io').BytesIO(get(f'{SITE}/img/hero-regents.jpg'))).convert('RGB')
r = max(W / photo.width, H / photo.height)
photo = photo.resize((int(photo.width * r) + 1, int(photo.height * r) + 1))
photo = photo.crop(((photo.width - W) // 2, (photo.height - H) // 2, (photo.width - W) // 2 + W, (photo.height - H) // 2 + H))
photo = ImageEnhance.Brightness(photo.filter(ImageFilter.GaussianBlur(2))).enhance(0.42)

scenes = []
# 첫 장면: 사진 + 제목
im = photo.copy()
d = ImageDraw.Draw(im)
d.rounded_rectangle((W / 2 - 230, 560, W / 2 + 230, 640), 40, fill=ROSE)
f = font('Bold', 44)
t = '국제학교 부모님 필독'
d.text(((W - d.textlength(t, font=f)) / 2, 575), t, font=f, fill='white')
block(d, nxt['title'], font('ExtraBold', 92), 720, W - 180, 'white')
f = font('Medium', 26)
t = 'Photo: Aliciaregents, CC BY-SA 4.0'
d.text((W - d.textlength(t, font=f) - 40, H - 60), t, font=f, fill=(220, 220, 220))
brand(d, (240, 225, 220))
scenes.append((im, 3.2))

# 요점 장면
for n, h in enumerate(heads, 1):
    im = Image.new('RGB', (W, H), CREAM if n % 2 else (246, 236, 232))
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, W, 18), fill=WINE)
    f = font('ExtraBold', 230)
    t = f'{n:02d}'
    d.text(((W - d.textlength(t, font=f)) / 2, 470), t, font=f, fill=ROSE)
    d.rounded_rectangle((W / 2 - 60, 760, W / 2 + 60, 770), 5, fill=WINE)
    block(d, h, font('ExtraBold', 84), 850, W - 200, INK)
    f = font('Medium', 38)
    t = f'{n} / {len(heads)}'
    d.text(((W - d.textlength(t, font=f)) / 2, 1500), t, font=f, fill=(150, 120, 120))
    brand(d, WINE)
    scenes.append((im, 2.6))

# 마지막 장면: 안내
im = Image.new('RGB', (W, H), WINE)
d = ImageDraw.Draw(im)
y = block(d, '국제학교 1:1 화상 과외', font('ExtraBold', 88), 620, W - 160, 'white')
y = block(d, 'IB · AP · IGCSE · A-Level', font('Bold', 52), y + 30, W - 160, (240, 210, 195))
d.rounded_rectangle((140, y + 90, W - 140, y + 250), 80, fill=CREAM)
f = font('ExtraBold', 58)
t = '10~15분 무료 테스트 수업'
d.text(((W - d.textlength(t, font=f)) / 2, y + 133), t, font=f, fill=WINE)
block(d, '프로필 링크에서 신청하세요', font('Bold', 50), y + 320, W - 160, 'white')
brand(d, (240, 210, 195))
scenes.append((im, 3.6))

# 3. 영상 만들기 (장면마다 살짝 확대 + 앞뒤 페이드) ------------------------------
parts = []
for k, (im, sec) in enumerate(scenes):
    png, mp4 = f'{OUT}/s{k}.png', f'{OUT}/s{k}.mp4'
    im.save(png)
    frames = int(sec * 30)
    vf = (f"scale=1188:2112,zoompan=z='1+0.0006*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s={W}x{H}:fps=30,"
          f"fade=t=in:st=0:d=0.25,fade=t=out:st={sec - 0.25}:d=0.25,format=yuv420p")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-loop', '1', '-i', png, '-t', str(sec), '-vf', vf,
                    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-r', '30', mp4], check=True)
    parts.append(mp4)
open(f'{OUT}/list.txt', 'w').write(''.join(f"file '{os.path.basename(p)}'\n" for p in parts))
reel = f'{OUT}/reel.mp4'
# 무음 오디오 트랙을 넣어 둔다(오디오가 아예 없는 영상은 가끔 처리 오류가 난다)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{OUT}/list.txt',
                '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest', '-c:v', 'copy', '-c:a', 'aac',
                '-movflags', '+faststart', reel], check=True)
print('영상:', reel, os.path.getsize(reel) // 1024, 'KB')

# 4. 캡션 ----------------------------------------------------------------------
caption = '\n'.join([
    nxt['title'], '', nxt['desc'], '',
    *[f'✔ {h}' for h in heads], '',
    '📌 저장해 두고 필요할 때 다시 보세요',
    '💬 궁금한 점은 댓글로 남겨 주세요',
    '', '국제학교 1:1 화상 과외 · 10~15분 무료 테스트 수업',
    '👉 프로필 링크에서 신청 (@intlschool_tutor)', '',
    '#국제학교 #국제학교과외 #국제학교입학 #IB #AP #IGCSE #Alevel #송도국제학교 #제주국제학교 #화상과외 #국제학교맘 #유학준비'])
open(f'{OUT}/caption.txt', 'w').write(caption)
if DRY or not TOKEN:
    print('DRY — 올리지 않음')
    sys.exit(0)

# 5. 릴스 올리기 (재개 가능 업로드 → 처리 끝날 때까지 기다림 → 게시) -------------
c = api(f'{IG}/media', {'media_type': 'REELS', 'upload_type': 'resumable', 'caption': caption,
                        'share_to_feed': 'true', 'thumb_offset': '1500'}, post=True)
size = os.path.getsize(reel)
up = json.loads(get(c['uri'], open(reel, 'rb').read(),
                    {'Authorization': f'OAuth {TOKEN}', 'offset': '0', 'file_size': str(size)}))
print('업로드:', up)
for _ in range(60):
    st = api(c['id'], {'fields': 'status_code,status'})
    if st.get('status_code') == 'FINISHED':
        break
    if st.get('status_code') == 'ERROR':
        raise SystemExit('처리 오류: ' + json.dumps(st, ensure_ascii=False))
    time.sleep(10)
p = api(f'{IG}/media_publish', {'creation_id': c['id']}, post=True)
link = api(p['id'], {'fields': 'permalink'}).get('permalink', '')
print('게시 완료:', nxt['title'], link)
