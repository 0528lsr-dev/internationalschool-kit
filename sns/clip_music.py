"""클립 영상 배경음악 (2026-11-26 사용자: "음악 넣어서 보내 주라, 앞으론")
저작권 걱정이 없게 직접 합성한다 — 부드러운 피아노풍 아르페지오 + 낮은 베이스 + 아주 작은 박자.
날짜마다 코드 진행·빠르기·조가 바뀌어 매일 같은 곡이 되지 않는다. 표준 라이브러리만 쓴다(wave·math·random)."""
import math, random, struct, wave

SR = 22050
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
# 밝고 차분한 진행들 (로마 숫자: I V vi IV 등)
PROGS = [
    [(0, 'M'), (7, 'M'), (9, 'm'), (5, 'M')],     # I V vi IV
    [(9, 'm'), (5, 'M'), (0, 'M'), (7, 'M')],     # vi IV I V
    [(0, 'M'), (9, 'm'), (5, 'M'), (7, 'M')],     # I vi IV V
    [(5, 'M'), (7, 'M'), (4, 'm'), (9, 'm')],     # IV V iii vi
    [(0, 'M'), (4, 'm'), (5, 'M'), (7, 'M')],     # I iii IV V
]
KEYS = ['C', 'D', 'F', 'G', 'A']
PATTERNS = [[0, 1, 2, 3, 2, 1, 2, 3], [0, 2, 1, 3, 2, 3, 1, 2], [0, 1, 2, 1, 3, 2, 1, 2]]


def freq(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def make(path, seconds, seed=0):
    rnd = random.Random(seed)
    prog, key = PROGS[seed % len(PROGS)], NOTE[KEYS[(seed // 5) % len(KEYS)]]
    pat = PATTERNS[(seed // 3) % len(PATTERNS)]
    bpm = 80 + (seed % 4) * 6
    eighth = 60 / bpm / 2
    n = int(seconds * SR)
    buf = [0.0] * n

    def add(f, start, dur, vol, decay, harm=(1, .35, .12)):
        s0, s1 = int(start * SR), min(n, int((start + dur) * SR))
        w = 2 * math.pi * f / SR
        for i in range(s0, s1):
            t = (i - s0) / SR
            env = min(1.0, t / 0.008) * math.exp(-decay * t)
            x = sum(a * math.sin(w * (k + 1) * (i - s0)) for k, a in enumerate(harm))
            buf[i] += vol * env * x

    bar = eighth * 8
    t, b = 0.0, 0
    while t < seconds:
        root, q = prog[b % len(prog)]
        base = 60 + key + root           # 가운데 도 근처
        tones = [base, base + (4 if q == 'M' else 3), base + 7, base + 12]
        add(freq(base - 24), t, bar, .16, 1.2, (1, .2))                 # 베이스
        for k, idx in enumerate(pat):                                   # 아르페지오
            add(freq(tones[idx]), t + k * eighth, eighth * 3, .10, 3.2)
        if b % 2 == 1:                                                  # 가끔 위 멜로디 한 음
            add(freq(tones[rnd.choice([1, 2, 3])] + 12), t + eighth * 4, eighth * 4, .06, 2.0)
        for k in range(4):                                              # 아주 작은 박자(잡음)
            s0 = int((t + k * eighth * 2) * SR)
            for i in range(s0, min(n, s0 + int(0.04 * SR))):
                buf[i] += (rnd.random() * 2 - 1) * .025 * math.exp(-((i - s0) / SR) * 90)
        t += bar
        b += 1
    peak = max(1e-9, max(abs(x) for x in buf))
    fade = int(1.5 * SR)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        out = bytearray()
        for i, x in enumerate(buf):
            g = min(1.0, i / (0.5 * SR), (n - i) / fade)
            out += struct.pack('<h', int(max(-1, min(1, x / peak * .85 * g)) * 32767))
        w.writeframes(bytes(out))
    return path


if __name__ == '__main__':
    import sys, time
    t0 = time.time(); make(sys.argv[1] if len(sys.argv) > 1 else 'music.wav', 28, int(sys.argv[2]) if len(sys.argv) > 2 else 0); print('ok', round(time.time() - t0, 1), 's')
