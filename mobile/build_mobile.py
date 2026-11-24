"""다르마 갤럭시 2027 · 모바일(안드로이드/PWA) 빌드
PC판 build.py가 만드는 것과 같은 게임 소스(src/, lib/, vendor/)를 쓰고,
모바일 레이어(mobile/web/)만 덧붙여 docs/m/ 에 설치형 웹앱을 만듭니다.
PC판 build.py를 실행하면 마지막에 이 파일의 make()가 자동으로 불려 두 판이 함께 갱신됩니다.
  python3 build.py                    → docs/index.html(PC) + docs/m/(모바일)
  python3 mobile/build_mobile.py      → 위와 같음
"""
import pathlib, runpy, shutil, time, re
B = pathlib.Path(__file__).resolve().parent.parent
W = B / 'mobile/web'
OUT = B / 'docs/m'
TITLE = '다르마 갤럭시 2027'

def make(h):

    # 1) 제목
    h = re.sub(r'<title>.*?</title>', f'<title>{TITLE}</title>', h, count=1)
    h = re.sub(r'(<header><h1>)(.*?)(<small)', lambda m: m.group(1) + TITLE + ' ' + m.group(3), h, count=1)
    for old in ['다르마 갤럭시 · 다갤', '다르마 갤럭시(다갤)']:
        h = h.replace(old, TITLE)

    # 2) 머리말: 모바일 뷰포트·설치 정보·모바일 스타일
    head = ('<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">'
            '<meta name="theme-color" content="#140f2e"><meta name="mobile-web-app-capable" content="yes">'
            '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="다르마 갤럭시">'
            '<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icons/icon-192.png"><link rel="apple-touch-icon" href="icons/icon-192.png">')
    h = re.sub(r'<meta name="viewport"[^>]*>', head, h, count=1)
    h = h.replace('</style></head>', '</style><style>' + (W / 'mobile.css').read_text() + '</style></head>', 1)

    # 3) 게임 스크립트 앞뒤로 모바일 레이어
    pre = '<script>' + (W / 'mobile-pre.js').read_text() + '</script>\n'
    i = h.index('<script>')
    h = h[:i] + pre + h[i:]
    post = '<script>' + (W / 'mobile.js').read_text() + '</script>\n'
    j = h.rindex('</body>')
    h = h[:j] + post + h[j:]

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'index.html').write_text(h)
    shutil.copy(W / 'manifest.webmanifest', OUT / 'manifest.webmanifest')
    (OUT / 'sw.js').write_text((W / 'sw.js').read_text().replace('__BUILD__', time.strftime('%Y%m%d%H%M')))
    shutil.copytree(W / 'icons', OUT / 'icons', dirs_exist_ok=True)
    print('mobile', len(h))


if __name__ == '__main__':
    runpy.run_path(str(B / 'build.py'))   # build.py가 make()를 부릅니다
