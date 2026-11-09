"""릴스·카드뉴스가 매일 똑같아 보이지 않게 — 날마다 색·배경 사진·표지 문구·배치를 돌려 쓴다 (2026-11-09)
- pick(offset): 오늘(KST) 날짜로 고르고, offset 을 다르게 주면 같은 날 릴스와 카드뉴스가 서로 다르게 나온다.
- 배경 사진은 sns/bg/ (위키미디어 공용, 출처는 credits.json — 빈 값은 퍼블릭 도메인·CC0)."""
import json, os
from datetime import datetime, timedelta, timezone

# (진한 바탕, 강조, 밝은 바탕, 글자, 흐린 글자, 진한 바탕 위 보조 글자)
PALETTES = [
    {'name': '버건디', 'dark': (122, 31, 61), 'accent': (192, 138, 115), 'light': (251, 247, 245), 'ink': (42, 26, 31), 'mute': (110, 90, 95), 'soft': (240, 210, 195)},
    {'name': '네이비', 'dark': (24, 42, 84), 'accent': (201, 160, 82), 'light': (247, 248, 252), 'ink': (20, 28, 45), 'mute': (85, 95, 115), 'soft': (225, 210, 170)},
    {'name': '포레스트', 'dark': (31, 77, 62), 'accent': (214, 170, 110), 'light': (246, 248, 243), 'ink': (22, 40, 33), 'mute': (85, 105, 95), 'soft': (225, 215, 180)},
    {'name': '차콜', 'dark': (38, 38, 44), 'accent': (232, 120, 90), 'light': (250, 247, 244), 'ink': (30, 30, 34), 'mute': (100, 96, 96), 'soft': (245, 200, 180)},
    {'name': '퍼플', 'dark': (68, 45, 120), 'accent': (240, 170, 90), 'light': (249, 247, 252), 'ink': (35, 25, 55), 'mute': (100, 90, 120), 'soft': (230, 205, 240)},
]
CHIPS = ['국제학교 부모님 필독', '저장해 두고 보세요', '국제학교 맘 체크리스트', '알아 두면 좋은 이야기', '상담 전에 꼭 확인']
HERE = os.path.dirname(os.path.abspath(__file__))
BG = json.load(open(os.path.join(HERE, 'bg', 'credits.json'), encoding='utf-8'))


def pick(offset=0):
    day = (datetime.now(timezone.utc) + timedelta(hours=9)).toordinal() + offset
    bg = BG[day % len(BG)]
    return {
        'pal': PALETTES[day % len(PALETTES)],
        'bg': os.path.join(HERE, 'bg', bg['file']),
        'credit': bg['credit'],
        'chip': CHIPS[(day // 3) % len(CHIPS)],
        'layout': day % 2,            # 0: 번호 크게 / 1: 번호 동그라미
    }
