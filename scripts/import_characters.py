"""Import supplied character portraits and public profile excerpts.

Usage: uv run --with pillow python scripts/import_characters.py <18_RenCrow>
Original files are read only. Only optimized portraits and curated text are copied.
"""
import json
import re
import sys
import subprocess
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1])
DEST = ROOT / 'public/assets/characters'
DEST.mkdir(parents=True, exist_ok=True)

SUMMARIES = [
    '物腰は優雅で、美しい食卓を好む。夜中のチーズや揚げ物には弱く、小さな贅沢を楽しむための上品な理由を見つけてしまう。',
    '「自分で選んだ」と思える装いを大切にする。近所へ出かけるだけでも靴が決まらない、頑固な美意識の持ち主。',
    '自分の顔も才能も大好き。格好よくなるための練習も失敗も隠さず、脇役を頼まれても最高の脇役になろうとする。',
    '無口で、人の説明より現物を信じる。誰かの小さな困りごとを覚えていて、言葉のかわりに、少し変わった道具を作る。',
    'ただ勝つだけでなく、格好よい相手を上回る瞬間を求める悪役。自分の誇りが、ときに勝利への遠回りになる。',
    '台所でも廊下でも、観客が一人でも本気で舞台を始める。褒められると、つい予定にない大技まで見せたくなる。',
    '仕事と約束の段取りは厳密。それでも自由時間は「面白そう」で動き、隣で一緒に余計なことを楽しむ大人。',
    '着飾ることも、踊ることも、恋をすることも、まだ十分ではない。大胆さと、初めてに挑む朝の小さな緊張を持つ。',
    '相手の自由を大切にし、別れ際はさっぱりしている。それなのに、何年も前の会話や好みを、いつまでも覚えている。',
    '人の反応とルールの隙間を見つけるのが得意。「その手があったか」と言わせたい、愛嬌があって油断ならない人。',
    '仕事を早く終えて定時に帰りたい。けれど、職場の小さな理不尽が気になって、帰宅後も最高の返しを考えてしまう。',
    '普段は冗談で重い空気をかわす。歌になると、日常では言えない本音が少しずつ言葉になる。',
    '美意識が鋭く、自分が納得できるまで作り直す。見た人の中に残る作品を求めて、完成直前に計画を壊すことさえある。',
    '小さな矛盾を見逃さない観察眼の持ち主。正解だけでは満足できず、種明かしで誰かを驚かせる演出まで考える。',
    '夜だけ現れる場所で、迷い込んだ人を帰す案内人。礼儀正しく約束を守る一方、自分の帰り道も探し続けている。',
    '用途不明の部品や誰かの使い古しに、特別な価値を見いだす収集家。拾ったものに立派な名前を付け、寝床まで埋めてしまう。',
    '身長三センチでも、自分は偉大な王。掃除や洗濯で城を失っても、「撤退」「遷都」と呼んで威厳を守る。',
    '人間の暮らしを熱心に観察する宇宙人。形と順番を覚えるのは得意だが、覚えたことを少し違う場面で使ってしまう。',
    '自分の名前で人間を震え上がらせたい怪異。恐怖演出の準備には熱心なのに、予定外の着信音や犬の声に弱い。',
    '落とし物も昼寝も、荘厳なニュースにしてしまう街の広報官。小さな変化を見つけることには、誰よりも真剣。',
    '王道のかわいさを磨き、センターを目指すアイドル。完成された笑顔の裏に、集中と野心、素直な喜びを持つ。',
    '精度の高い身体表現を磨くダンスアイドル。落ち着いた姿のなかで、率直な応援を受けた瞬間だけ表情が少し緩む。',
    '静かで観察好きな読書家。気に入った一冊と過ごす時間を大切にするあまり、最後の一ページを取っておきたくなる。',
    '何かが起きる前に動く、観察好きで少しせっかちな人。証拠が足りないときは待ち、目立たない成功にもひそかに満足する。',
    '面白い音に出会うと、その場に長く留まる。完璧な録音よりも、その場所が生きている感じを大事にしている。',
    '夜明けに消える庭を、毎晩丁寧に作る。光の角度への判断は頑固で、自分の作品が消える瞬間まで見届ける。',
    '昨日の成功をそのまま再生することを嫌う。練習した技術を土台に、その場でしか生まれない音を選ぶ。',
    '身近な道具で部屋を違う場所に見立てる、想像力豊かな大人。外へ出なくても、毎晩違う旅が始まる。',
    '相手の言葉をよく聴き、整えすぎずに届ける。誰かの恋文は書けるのに、自分の望みを伝える一行だけは書き直してしまう。',
    '仕掛けの準備には粘り強く、人前では芝居がかった丁寧さを楽しむ。自分の技術以上に、まだ知らない驚きへ飢えている。',
    '小さな魔法を、どう見せたらもっときれいになるか考える。見る人が少し身を寄せる、その一瞬を楽しみにしている。',
    '自分がかわいいと思った魔法を集める静かな収集家。小さな違いを見逃さず、好きなものの話になると少しだけ早口になる。',
]

def optimize(src, slug, size=(960, 1280), quality=88):
    with Image.open(src) as original:
        im = ImageOps.exif_transpose(original)
        im.thumbnail(size, Image.Resampling.LANCZOS)
        im = im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
        im.save(DEST / (slug + '.webp'), 'WEBP', quality=quality, method=6)
        return im.size

characters = []
provenance = []
main_names = [('Mio', 'ミオ'), ('Midori', 'ミドリ'), ('Shiro', 'シロ'), ('Kuro', 'クロ'), ('Lumina', 'ルミナ'), ('Aka', 'アカ'), ('Ao', 'アオ'), ('Kin', 'キン'), ('Gin', 'ギン')]
for i, (english, name) in enumerate(main_names):
    group = 'main' if i < 4 else 'friend' if i == 4 else 'support'
    slug = english.lower()
    source = SOURCE / 'Char' / english / (english + ('_01.png' if i < 5 else '_basic.png'))
    width, height = optimize(source, slug)
    sheet_source = source.with_name(english + ('_charsheet_01.png' if i < 5 else '_base.png'))
    sheet_width, sheet_height = optimize(sheet_source, slug + '-sheet', (2400, 3400), 94)
    characters.append(dict(id=slug, name=name, english=english, group=group, number=i+1, tagline='', description='', image=f'/assets/characters/{slug}.webp', width=width, height=height, sheet=f'/assets/characters/{slug}-sheet.webp', sheetWidth=sheet_width, sheetHeight=sheet_height))
    provenance.append(f'| {english} | {source.relative_to(SOURCE)} | ユーザー指定の名前・区分。人物設定の創作なし |')
    provenance.append(f'| {english} 紹介シート | {sheet_source.relative_to(SOURCE)} | 既存シートを縮小・WebP変換。全文表示 |')

ip_source = SOURCE / '有限会社RenCrow/RenCrow_32characters/32char'
for i, directory in enumerate(sorted(p for p in ip_source.iterdir() if p.is_dir())):
    text_file = next(directory.glob('*.md'))
    text = text_file.read_text(encoding='utf-8-sig')
    heading = re.match(r'#\s+\d+\s+(.+?)\s*/\s*(.+)', text)
    name, english = heading.groups()
    slug = english.strip().lower()
    tagline = re.search(r'^> \*\*(.+?)\*\*', text, re.M).group(1)
    candidates = sorted(directory.glob('*portrait*.png'))
    source = next((p for p in candidates if p.stem.endswith('_new')), None) or next((p for p in candidates if p.stem.endswith('_portrait')), None) or candidates[0]
    width, height = optimize(source, slug)
    sheet_source = next(directory.glob('*visual_sheet.png'))
    sheet_width, sheet_height = optimize(sheet_source, slug + '-sheet', (2400, 3400), 94)
    characters.append(dict(id=slug, name=name, english=english, group='ip', number=i+1, tagline=tagline, description=SUMMARIES[i], image=f'/assets/characters/{slug}.webp', width=width, height=height, sheet=f'/assets/characters/{slug}-sheet.webp', sheetWidth=sheet_width, sheetHeight=sheet_height))
    provenance.append(f'| {name} / {english} | 32char/{directory.name}/{source.name} | {text_file.name}の人物設定を紹介用に要約。内部の運営・収益化案は除外 |')
    provenance.append(f'| {name} 紹介シート | 32char/{directory.name}/{sheet_source.name} | 既存のビジュアルシートを全文表示 |')

(ROOT / 'content').mkdir(exist_ok=True)
(ROOT / 'content/characters.json').write_text(json.dumps(characters, ensure_ascii=False, indent=2) + '\n')
(ROOT / 'docs').mkdir(exist_ok=True)
(ROOT / 'docs/CONTENT_SOURCES.md').write_text('# 掲載内容の出典\n\nユーザーが指定した `18_RenCrow/Char` と `18_RenCrow/有限会社RenCrow/RenCrow_32characters/32char` を読み取り専用で参照。原資料は変更していません。\n\nメイン4人・お友達1人・サブ4人の分類と名称はユーザー指定。IP32人の名称・キャッチコピーと人物設定は各Markdownに基づきます。原資料が企画案を含むため、IPページにも制作中の設定を含む旨を表示します。Markdown原文、運営手順、市場調査本文、生成プロンプトは公開しません。ユーザー指定のデータシート画像は全文掲載し、画像内には企画段階の運用・展開案を含みます。\n\n画像はポートレートを優先し、WebPに縮小・変換。再描画・人物の変更なし。元ファイル名と見出し番号の揺れは、人物フォルダと本文の名前で対応を確認しました。\n\n| キャラクター | 使用画像（指定フォルダ基準） | 内容の扱い |\n|---|---|---|\n' + '\n'.join(provenance) + '\n')
print(f'Imported {len(characters)} characters; source files unchanged.')
subprocess.run([sys.executable, str(ROOT / 'scripts/import_ip_details.py'), str(SOURCE)], check=True)
