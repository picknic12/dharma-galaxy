# 다르마 갤럭시 · 다갤 (DHARMA GALAXY)

> 인간 vs AI · 2.5D 다중우주 경제 전략 RPG — 은하문명의 창조자들
> 저자: 피크닉 신영호 · 임지혜 (이스턴드래곤 출판사)

우주가 곧 보드입니다. 지휘관 한 사람이 AI 문명 1~7개와 함께 은하 항로를 돌며 행성 자산을 사고 개발하고, 상대 AI의 다음 수를 읽습니다. 경기의 흐름은 오행의 순환(木→火→土→金→水)과 실제 날짜의 일진(日辰)·별자리·달의 위상을 따라 움직입니다. 흐름은 운명이 아니라 경향이며, 선택은 언제나 지휘관에게 남습니다.

- ▶ 바로 플레이: GitHub Pages (`docs/index.html`) — 저장소 Settings → Pages에서 주소 확인
- 📖 규칙 안내서: [docs/RULES.md](docs/RULES.md)

## 폴더 구조

| 경로 | 내용 |
|---|---|
| `lib/` | 재사용 라이브러리(UMD): picnicRng · ohaengCycle · scoreGrade(사주RPG에서 추출), astroCalendar, spriteKit, multiverse, cosmicMusic, itemCatalog |
| `src/` | 게임 본체 `game1~9.js`, `style.css`, `index.html` 틀, `rules.html`, `dungeonSfx.js`(사주RPG) |
| `vendor/` | 공개 라이브러리와 라이선스 |
| `build.py` | 모든 파일을 하나의 HTML(`docs/index.html`)로 묶습니다 |
| `tests/` | Playwright 자동 대국 테스트 |

## 수정 · 재배포

```bash
python3 build.py          # docs/index.html 다시 만들기
git add -A && git commit -m "수정 내용" && git push   # Pages가 자동으로 새 버전을 배포
```

## 사용한 공개 라이브러리

three.js 0.149 (MIT) · Tone.js 14.7.77 (MIT) · anime.js 3.2.2 (MIT) · canvas-confetti 1.9.3 (ISC). 각 라이선스는 `vendor/` 폴더에 있습니다.

© 2026 피크닉 신영호 · 임지혜 (이스턴드래곤 출판사). 게임 코드와 콘텐츠의 저작권은 저자에게 있습니다.
