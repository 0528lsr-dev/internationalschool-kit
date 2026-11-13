"""네이버 블로그용 카드 이미지 — 국제학교 외 주제(티쳐포유·자판기마켓·말트임) 글에 넣을 사진을 글 내용으로 만든다 (2026-11-09)
- 표지(제목) + 소제목('■ ')마다 한 장(최대 5장) + 마지막 안내 1장, 1080x1080 JPG.
- 본문에 [카드 N] 자리를 넣어 돌려준다: [카드 1]은 첫 문단 뒤, 소제목 카드는 그 소제목 바로 위, 마지막 카드는 '👉' 줄 위.
- 사진 없이 글자·색으로만 만든다(저작권 걱정 없음). 색은 브랜드마다 다르고(sns/style.py 팔레트), 날마다 배치가 바뀐다."""
import os, re, urllib.request
from datetime import datetime, timedelta, timezone
from PIL import Image, ImageDraw, ImageFont
import style

W = H = 1080
BRANDS = {   # 브랜드: (사이트, 팔레트 번호, 한 줄 소개)
    '티쳐포유': ('teacher4u.co.kr', 1, '중·고등 1:1 과외 · 수학 영어 국어 사회 과학'),
    '자판기마켓': ('mooinstore.kr', 'vending', '자판기 구매 · 렌탈 · 설치 상담'),
    '말트임 영어회화': ('seochoedu.co.kr', 2, '성인 1:1 전화·화상 영어 · 비즈니스 · 시험 대비'),
    '국제학교튜터': ('internationalschool.kr', 0, '국제학교 1:1 화상 과외 · IB AP IGCSE A-Level'),
}
# 자판기마켓 카드 색 — 날마다 3가지를 돌아가며 (사이트 남색·오렌지 / 오렌지 / 민트, 2026-11-13)
VENDING_PALS = [
    {'name': '남색', 'dark': (15, 42, 74), 'accent': (255, 138, 0), 'light': (244, 247, 251), 'ink': (27, 36, 48), 'mute': (91, 102, 118), 'soft': (255, 200, 120)},
    {'name': '오렌지', 'dark': (222, 104, 8), 'accent': (15, 42, 74), 'light': (255, 247, 236), 'ink': (45, 30, 15), 'mute': (115, 92, 70), 'soft': (255, 228, 195)},
    {'name': '민트', 'dark': (13, 110, 100), 'accent': (255, 176, 32), 'light': (239, 250, 247), 'ink': (16, 46, 42), 'mute': (78, 108, 102), 'soft': (190, 240, 228)},
]
FONT = {k: f'out/Pretendard-{k}.otf' for k in ('Bold', 'ExtraBold', 'Medium')}


def font(k, size):
    if not os.path.exists(FONT[k]):
        os.makedirs('out', exist_ok=True)
        with urllib.request.urlopen(f'https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-{k}.otf', timeout=60) as r:
            open(FONT[k], 'wb').write(r.read())
    return ImageFont.truetype(FONT[k], size)


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


def block(d, text, f, y, width, fill, x=None, gap=1.32, max_lines=None):
    lines = wrap(d, text, f, width)
    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = lines[-1][:-1] + '…'
    for ln in lines:
        d.text(((W - d.textlength(ln, font=f)) / 2 if x is None else x, y), ln, font=f, fill=fill)
        y += int(f.size * gap)
    return y


def make(title, body, out_dir):
    m = re.search(r'안녕하세요,\s*(.+?)입니다', body)
    brand = next((b for b in BRANDS if m and b in m.group(1)), '티쳐포유')
    site, pal_i, tagline = BRANDS[brand]
    day = (datetime.now(timezone.utc) + timedelta(hours=9)).toordinal()
    P = VENDING_PALS[day % len(VENDING_PALS)] if pal_i == 'vending' else style.PALETTES[pal_i]
    layout = day % 2
    os.makedirs(out_dir, exist_ok=True)

    paras = [p for p in body.split('\n\n')]
    heads = [(i, p.split('\n')[0][2:].strip(), [l.strip(' ·').strip() for l in p.split('\n')[1:] if l.strip()])
             for i, p in enumerate(paras) if p.startswith('■ ')][:5]
    # 소제목 아래 내용이 같은 문단에 없으면 다음 문단에서 가져온다
    heads = [(i, h, lines or ([l for l in paras[i + 1].split('\n') if l.strip()][:3] if i + 1 < len(paras) else []))
             for i, h, lines in heads]
    total = len(heads) + 2
    imgs = []

    def foot(d, fill, n):
        f = font('Bold', 30)
        d.text((70, H - 75), brand, font=f, fill=fill)
        t = f'{n} / {total}'
        d.text((W - 70 - d.textlength(t, font=f), H - 75), t, font=f, fill=fill)

    # 1. 표지
    im = Image.new('RGB', (W, H), P['dark'])
    d = ImageDraw.Draw(im)
    if layout == 0:
        d.rectangle((70, 300, 82, 560), fill=P['accent'])
        block(d, title, font('ExtraBold', 78), 300, W - 200, 'white', x=120, max_lines=4)
    else:
        d.ellipse((W / 2 - 40, 220, W / 2 + 40, 300), fill=P['accent'])
        block(d, title, font('ExtraBold', 76), 360, W - 160, 'white', max_lines=4)
    block(d, tagline, font('Medium', 34), H - 200, W - 160, P['soft'])
    foot(d, P['soft'], 1)
    imgs.append(im)

    # 2. 소제목 카드
    for n, (_, h, lines) in enumerate(heads, 1):
        im = Image.new('RGB', (W, H), P['light'])
        d = ImageDraw.Draw(im)
        if layout == 0:
            d.rectangle((0, 0, W, 14), fill=P['dark'])
            d.text((70, 90), f'{n:02d}', font=font('ExtraBold', 120), fill=P['accent'])
        else:
            d.rectangle((0, 0, 14, H), fill=P['accent'])
            d.ellipse((70, 100, 210, 240), fill=P['dark'])
            f = font('ExtraBold', 68)
            d.text((140 - d.textlength(f'{n:02d}', font=f) / 2, 132), f'{n:02d}', font=f, fill='white')
        y = block(d, h, font('ExtraBold', 60), 280, W - 140, P['ink'], x=70, max_lines=3)
        d.rectangle((70, y + 20, 180, y + 27), fill=P['dark'])
        y += 70
        fb = font('Medium', 38)
        for ln in [re.sub(r'^(·\s*|\d\)\s*)', '', l.strip()) for l in lines][:3]:
            if y > H - 220:
                break
            d.ellipse((74, y + 16, 90, y + 32), fill=P['accent'])
            y = block(d, ln, fb, y, W - 200, P['mute'], x=112, gap=1.42, max_lines=3) + 22
        foot(d, P['dark'], n + 1)
        imgs.append(im)

    # 3. 마지막 안내
    im = Image.new('RGB', (W, H), P['dark'])
    d = ImageDraw.Draw(im)
    y = block(d, brand, font('ExtraBold', 84), 330, W - 160, 'white')
    y = block(d, tagline, font('Bold', 40), y + 20, W - 180, P['soft'])
    d.rounded_rectangle((140, y + 70, W - 140, y + 200), 65, fill=P['light'])
    f = font('ExtraBold', 50)
    t = '무료 상담 010-5577-3067'
    d.text(((W - d.textlength(t, font=f)) / 2, y + 107), t, font=f, fill=P['dark'])
    block(d, site, font('Bold', 40), y + 250, W - 160, 'white')
    foot(d, P['soft'], total)
    imgs.append(im)

    paths = []
    for k, im in enumerate(imgs, 1):
        p = os.path.join(out_dir, f'{k}.jpg')
        im.save(p, quality=90)
        paths.append(p)

    # 본문에 [카드 N] 자리 넣기
    out = list(paras)
    for n, (i, _, _) in reversed(list(enumerate(heads, 2))):
        out.insert(i, f'[카드 {n}]')
    out.insert(1, '[카드 1]')
    k = next((j for j, p in enumerate(out) if p.startswith('👉')), len(out))
    out.insert(k, f'[카드 {total}]')
    return '\n\n'.join(out), paths
