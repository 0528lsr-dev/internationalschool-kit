"""네이버 블로그용 카드 이미지 — 국제학교 외 주제(티쳐포유·자판기마켓·말트임) 글에 넣을 사진을 글 내용으로 만든다 (2026-11-09)
- 표지(제목) + 소제목('■ ')마다 한 장(최대 5장) + 마지막 안내 1장, 1080x1080 JPG.
- 본문에 [카드 N] 자리를 넣어 돌려준다: [카드 1]은 첫 문단 뒤, 소제목 카드는 그 소제목 바로 위, 마지막 카드는 '👉' 줄 위.
- 사진 없이 글자·색으로만 만든다(저작권 걱정 없음). 색은 브랜드마다 다르고(sns/style.py 팔레트), 날마다 배치가 바뀐다."""
import os, re, shutil, subprocess, urllib.request
from datetime import datetime, timedelta, timezone
from PIL import Image, ImageDraw, ImageFont
import style

W = H = 1080
BRANDS = {   # 브랜드: (사이트, 팔레트 번호, 한 줄 소개)
    '티쳐포유': ('teacher4u.co.kr', 1, '중·고등 1:1 과외 · 수학 영어 국어 사회 과학'),
    '자판기마켓': ('mooinstore.kr', 'vending', '자판기 구매 · 렌탈 · 설치 상담'),
    '말트임 영어회화': ('seochoedu.co.kr', 2, '성인 1:1 전화·화상 영어 · 비즈니스 · 시험 대비'),
    '말트임 1:1 회화': ('seochoedu.co.kr', 2, '성인 1:1 전화·화상 영어 · 중국어 · 일본어 회화'),   # 말트임 블로그 중국어·일본어 글 (2026-11-13)
    '국제학교튜터': ('internationalschool.kr', 0, '국제학교 1:1 화상 과외 · IB AP IGCSE A-Level'),
    # 공부 길잡이 블로그는 인사를 하나로 통일(2026-11-15) — 사이트는 글 끝 👉 링크에서 읽는다
    '공부 길잡이': ('', 4, '중고등 내신·수능 · 국제학교 · 유학'),
}
# 자판기마켓 카드 색 — 날마다 3가지를 돌아가며 (사이트 남색·오렌지 / 오렌지 / 민트, 2026-11-13)
VENDING_PALS = [
    {'name': '남색', 'dark': (15, 42, 74), 'accent': (255, 138, 0), 'light': (244, 247, 251), 'ink': (27, 36, 48), 'mute': (91, 102, 118), 'soft': (255, 200, 120)},
    {'name': '오렌지', 'dark': (222, 104, 8), 'accent': (15, 42, 74), 'light': (255, 247, 236), 'ink': (45, 30, 15), 'mute': (115, 92, 70), 'soft': (255, 228, 195)},
    {'name': '민트', 'dark': (13, 110, 100), 'accent': (255, 176, 32), 'light': (239, 250, 247), 'ink': (16, 46, 42), 'mute': (78, 108, 102), 'soft': (190, 240, 228)},
]
# 공부 길잡이 블로그 카드 색 — 카테고리별로 다르게 (2026-11-18 사용자: "맨날 보라색 괜찮아?")
# 말트임 블로그 색(포레스트 초록)은 쓰지 않는다. 앞에서부터 맞는 것을 고른다.
GILJABI_PALS = [
    ('학부모 영어', 4),        # 퍼플
    ('국제학교', 0),           # 버건디 (국제학교튜터 사이트 색)
    ('유학', 1),               # 네이비
    ('공지', 0),
    ('중고등', 'blue'),        # 중고등 내신·수능 — 파랑
]
BLUE_PAL = {'name': '블루', 'dark': (22, 92, 160), 'accent': (255, 196, 60), 'light': (244, 248, 253), 'ink': (20, 32, 48), 'mute': (85, 100, 120), 'soft': (200, 225, 250)}
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


def make(title, body, out_dir, category=''):
    m = re.search(r'안녕하세요,\s*(.+?)입니다', body)
    brand = next((b for b in BRANDS if m and b in m.group(1)), '티쳐포유')
    site, pal_i, tagline = BRANDS[brand]
    if not site:
        u = re.search(r'👉[^\n]*?https?://([^/\s?]+)', body)
        site = u.group(1) if u else 'internationalschool.kr'
        # 공부 길잡이 블로그 카드에는 말트임 주소를 쓰지 않는다(2026-11-18: 학부모 영어 글 카드에 seochoedu.co.kr 이 찍혀 말트임 글처럼 보임)
        if 'seochoedu' in site:
            site = 'internationalschool.kr'
    # 카드에 크게 넣을 혜택 문구 — 사이트별로 사실에 맞게 (국제학교 20분·티쳐포유 30분 테스트 수업, 자판기는 상담·견적)
    OFFER = ('무료 상담', '설치 장소에 맞는 기종 추천') if pal_i == 'vending' else         ('무료 테스트수업', '20분 테스트 수업으로 지금 실력 확인') if 'internationalschool' in site else         ('무료 테스트수업', '첫 테스트 수업 30분 무료') if 'teacher4u' in site else         ('무료 테스트수업', '지금 실력부터 부담 없이 확인')
    day = (datetime.now(timezone.utc) + timedelta(hours=9)).toordinal()
    if brand == '공부 길잡이' and category:
        pal_i = next((p for k, p in GILJABI_PALS if k in category), pal_i)
    P = VENDING_PALS[day % len(VENDING_PALS)] if pal_i == 'vending' else BLUE_PAL if pal_i == 'blue' else style.PALETTES[pal_i]
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
    # 무료 레벨테스트 띠 (2026-11-18 사용자: "무료 레벨테스트를 가장 크게, 구미 당기게")
    f = font('ExtraBold', 60)
    t = OFFER[0] + ' 신청 →'
    tw = d.textlength(t, font=f)
    d.rounded_rectangle(((W - tw) / 2 - 50, H - 270, (W + tw) / 2 + 50, H - 150), 60, fill=P['accent'])
    d.text(((W - tw) / 2, H - 247), t, font=f, fill=P['dark'])
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
    # 무료 레벨테스트를 이 카드에서 가장 크게 (2026-11-18)
    y = block(d, brand, font('Bold', 40), 150, W - 160, P['soft'])
    y = block(d, OFFER[0].split(' ')[0], font('ExtraBold', 150), y + 40, W - 120, P['accent'])
    y = block(d, ' '.join(OFFER[0].split(' ')[1:]), font('ExtraBold', 150), y - 10, W - 120, 'white')
    y = block(d, OFFER[1], font('Bold', 44), y + 20, W - 160, P['soft'])
    d.rounded_rectangle((140, y + 50, W - 140, y + 170), 60, fill=P['light'])
    f = font('ExtraBold', 50)
    t = '상담 010-5577-3067'
    d.text(((W - d.textlength(t, font=f)) / 2, y + 82), t, font=f, fill=P['dark'])
    block(d, site, font('Bold', 38), y + 210, W - 160, 'white')
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
    # 네이버 클립용 세로 영상 (2026-11-23) — 실패해도 카드·글은 그대로 보낸다
    if os.environ.get('CLIP', '1') == '1' and shutil.which('ffmpeg'):
        try:
            make_clip(title, heads, P, brand, OFFER, site, out_dir)
        except Exception as e:
            print('클립 영상 실패:', e)
    return '\n\n'.join(out), paths


# ---------- 네이버 클립 세로 영상 (1080x1920, 약 25~30초, 무음) ----------
# 블로그 3개(국제학교·티쳐포유 / 말트임 / 자판기) 초안마다 하나씩 만든다. 사용자가 네이버 블로그 앱 클립으로 올리고 음악을 넣는다.
CW, CH = 1080, 1920


def make_clip(title, heads, P, brand, OFFER, site, out_dir):
    scenes = []
    # 1. 표지 — 제목 크게, 아래 혜택 띠
    im = Image.new('RGB', (CW, CH), P['dark'])
    d = ImageDraw.Draw(im)
    block(d, brand, font('Bold', 44), 230, CW - 160, P['soft'])
    d.rectangle((CW / 2 - 60, 330, CW / 2 + 60, 340), fill=P['accent'])
    block(d, title, font('ExtraBold', 96), 520, CW - 140, 'white', max_lines=5)
    f = font('ExtraBold', 66)
    t = OFFER[0]
    tw = d.textlength(t, font=f)
    d.rounded_rectangle(((CW - tw) / 2 - 60, CH - 470, (CW + tw) / 2 + 60, CH - 330), 70, fill=P['accent'])
    d.text(((CW - tw) / 2, CH - 442), t, font=f, fill=P['dark'])
    block(d, '끝까지 보고 저장해 두세요', font('Bold', 40), CH - 250, CW - 160, P['soft'])
    scenes.append((im, 3.5))
    # 2. 소제목마다 한 장
    for n, (_, h, lines) in enumerate(heads, 1):
        im = Image.new('RGB', (CW, CH), P['light'])
        d = ImageDraw.Draw(im)
        d.rectangle((0, 0, CW, 18), fill=P['dark'])
        d.text((80, 230), f'{n:02d}', font=font('ExtraBold', 170), fill=P['accent'])
        y = block(d, h, font('ExtraBold', 80), 470, CW - 160, P['ink'], x=80, max_lines=3)
        d.rectangle((80, y + 30, 220, y + 40), fill=P['dark'])
        y += 110
        fb = font('Medium', 52)
        for ln in [re.sub(r'^(·\s*|\d\)\s*)', '', l.strip()) for l in lines][:3]:
            if y > CH - 420:
                break
            d.ellipse((84, y + 22, 106, y + 44), fill=P['accent'])
            y = block(d, ln, fb, y, CW - 230, P['mute'], x=134, gap=1.4, max_lines=3) + 34
        f = font('Bold', 40)
        d.text((80, CH - 160), brand, font=f, fill=P['dark'])
        t = f'{n} / {len(heads)}'
        d.text((CW - 80 - d.textlength(t, font=f), CH - 160), t, font=f, fill=P['dark'])
        scenes.append((im, 3.8))
    # 3. 마지막 — 혜택을 가장 크게
    im = Image.new('RGB', (CW, CH), P['dark'])
    d = ImageDraw.Draw(im)
    y = block(d, brand, font('Bold', 48), 330, CW - 160, P['soft'])
    words = OFFER[0].split(' ')
    y = block(d, words[0], font('ExtraBold', 200), y + 80, CW - 120, P['accent'])
    y = block(d, ' '.join(words[1:]), font('ExtraBold', 150), y, CW - 100, 'white')
    y = block(d, OFFER[1], font('Bold', 52), y + 40, CW - 160, P['soft'])
    d.rounded_rectangle((120, y + 80, CW - 120, y + 230), 75, fill=P['light'])
    f = font('ExtraBold', 60)
    t = '상담 010-5577-3067'
    d.text(((CW - d.textlength(t, font=f)) / 2, y + 120), t, font=f, fill=P['dark'])
    block(d, '자세한 내용은 블로그 글에서', font('Bold', 44), y + 300, CW - 160, 'white')
    block(d, site, font('Bold', 44), y + 370, CW - 160, P['soft'])
    scenes.append((im, 4.5))

    tmp = os.path.join(out_dir, 'clip_tmp')
    os.makedirs(tmp, exist_ok=True)
    parts = []
    for k, (im, sec) in enumerate(scenes):
        png, mp4 = os.path.join(tmp, f's{k}.png'), os.path.join(tmp, f's{k}.mp4')
        im.save(png)
        frames = int(sec * 30)
        vf = (f"scale=1188:2112,zoompan=z='1+0.0006*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s={CW}x{CH}:fps=30,"
              f"fade=t=in:st=0:d=0.25,fade=t=out:st={sec - 0.25}:d=0.25,format=yuv420p")
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-loop', '1', '-i', png, '-t', str(sec), '-vf', vf,
                        '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-r', '30', mp4], check=True)
        parts.append(os.path.abspath(mp4).replace('\\', '/'))
    lst = os.path.join(tmp, 'list.txt')
    open(lst, 'w', encoding='utf-8').write(''.join(f"file '{p}'\n" for p in parts))
    clip = os.path.join(out_dir, 'clip.mp4')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst,
                    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest', '-c:v', 'copy', '-c:a', 'aac',
                    '-movflags', '+faststart', clip], check=True)
    print('클립 영상:', clip, os.path.getsize(clip) // 1024, 'KB')
    return clip
