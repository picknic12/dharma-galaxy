import json,pathlib
B=pathlib.Path(__file__).resolve().parent
css=(B/'src/style.css').read_text()
vendor='\n'.join([(B/'vendor/three/three.min.js').read_text(),(B/'vendor/anime/anime.min.js').read_text(),(B/'vendor/confetti/confetti.browser.js').read_text(),(B/'vendor/tone/Tone.js').read_text().replace('//# sourceMappingURL=Tone.js.map','')])
lib='\n'.join((B/'lib'/f).read_text() for f in ['picnicRng.js','ohaengCycle.js','scoreGrade.js','astroCalendar.js','spriteKit.js','multiverse.js','cosmicMusic.js','itemCatalog.js'])+'\n'+(B/'src/dungeonSfx.js').read_text()
game='\n'.join((B/'src'/f).read_text() for f in ['game1.js','game2.js','game3.js','game4.js','game5.js','game6.js','game8.js','game9.js','game7.js'])
h=(B/'src/index.html').read_text()
h=h.replace('/*__CSS__*/',css).replace('/*__VENDOR__*/',vendor.replace('</script','<\\/script')).replace('/*__LIB__*/',lib).replace('/*__RULES__*/',json.dumps((B/'src/rules.html').read_text(),ensure_ascii=False)).replace('/*__GAME__*/',game)
(B/'docs').mkdir(exist_ok=True);(B/'docs/index.html').write_text(h)
print(len(h))
