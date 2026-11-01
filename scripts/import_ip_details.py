"""Import each IP character's supplied image set and public-facing profile sections."""
import hashlib
import json
import re
import sys
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1]) / '有限会社RenCrow/RenCrow_32characters/32char'
DEST = ROOT / 'public/assets/characters'
characters = json.loads((ROOT / 'content/characters.json').read_text())
records = []

def plain(value):
    return re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', value).replace('**', '').replace('`', '').strip()

def paragraphs(value):
    return [plain(p) for p in re.split(r'\n\s*\n', value.strip()) if p.strip() and not p.lstrip().startswith(('>', '|'))]

def section(text, prefix):
    for heading, body in re.findall(r'^### ([^\n]+)\n(.*?)(?=^### |\Z)', text, re.M | re.S):
        if heading.startswith(prefix):
            return body.strip()
    return ''

def field(body, key):
    match = re.search(r'\*\*' + re.escape(key) + r'\*\*\s*[：:]\s*(.*?)(?=\n\s*\n\*\*|\n\s*>|\Z)', body, re.S)
    return paragraphs(match.group(1)) if match else []

def image_asset(character, source, kind, label, existing_src=None):
    stem = character['id'] + '-' + kind
    with Image.open(source) as original:
        full = ImageOps.exif_transpose(original)
        full = full.convert('RGBA' if 'A' in full.getbands() else 'RGB')
        full.thumbnail((2000, 2800), Image.Resampling.LANCZOS)
        if not existing_src:
            full.save(DEST / (stem + '.webp'), 'WEBP', quality=94 if kind == 'datasheet' else 90, method=6)
        width, height = full.size
        thumb = full.copy()
        thumb.thumbnail((420, 560), Image.Resampling.LANCZOS)
        thumb.save(DEST / (stem + '-thumb.webp'), 'WEBP', quality=84, method=6)
    records.append(f'| {character["name"]} | {label} | {source.parent.name}/{source.name} | `{hashlib.sha256(source.read_bytes()).hexdigest()}` |')
    return dict(kind=kind, label=label, src=existing_src or f'/assets/characters/{stem}.webp', thumbnail=f'/assets/characters/{stem}-thumb.webp', width=width, height=height, thumbWidth=thumb.width, thumbHeight=thumb.height)

for character in characters:
    if character['group'] != 'ip':
        continue
    directory = next(p for p in SOURCE.iterdir() if p.is_dir() and p.name.startswith(f'{character["number"]:02}_'))
    markdown = next(directory.glob('*.md'))
    text = markdown.read_text(encoding='utf-8-sig')
    personality = section(text, '人格')
    appearance = section(text, '見た目')
    basic = section(text, '基本プロフィール')
    facts = []
    for key, value in re.findall(r'^\| ([^|]+) \| ([^|]+) \|', basic, re.M):
        key, value = key.strip(), plain(value)
        if key in ['仮年齢・外見年齢', '性別', '存在・役割', 'シリーズ', 'シリーズ・企画']:
            if key == '仮年齢・外見年齢' and '未設定' in value:
                value = '未設定'
            facts.append(dict(label={'仮年齢・外見年齢': '年齢（設定案）', '存在・役割': '存在・役割', 'シリーズ・企画': 'シリーズ（企画案）'}.get(key, key), value=value))
    traits = []
    for key in ['欲しいもの', '選ぶ基準', '得意なこと', '弱点・崩れる場面', '相手との距離', '話し方', '格好よく見える瞬間', '人物の選ぶ基準']:
        values = field(personality, key)
        if values:
            traits.append(dict(label=key, paragraphs=values))
    scene_body = section(text, '既存イメージ') or section(text, 'イメージ3場面')
    scenes = []
    for line in scene_body.splitlines():
        if not line.startswith('|'):
            continue
        cells = [plain(cell) for cell in line.strip('|').split('|')]
        if len(cells) >= 2 and cells[0] not in ['位置', 'カット'] and not re.fullmatch(r'[-: ]+', cells[0]):
            scenes.append(dict(title=cells[0], description=cells[1]))
    character['details'] = dict(
        facts=facts,
        personality=paragraphs(personality.split('**', 1)[0]),
        traits=traits,
        quotes=[plain(v) for v in re.findall(r'^> (.+)$', personality, re.M)],
        appearance=paragraphs(appearance.split('**', 1)[0]),
        scenes=scenes[:3],
    )
    portraits = sorted(directory.glob('*portrait*.png'))
    portrait = next((p for p in portraits if p.stem.endswith('_new')), None) or next((p for p in portraits if p.stem.endswith('_portrait')), None) or portraits[0]
    bodies = sorted(directory.glob('*full*body*.png'))
    fullbody = next((p for p in bodies if 'corrected' in p.stem), None) or next((p for p in bodies if p.stem.endswith('_new')), None) or bodies[0]
    concept = next(directory.glob('*.jpg'), None)
    if not concept:
        concept = next(p for p in directory.glob('*.png') if re.fullmatch(r'\d+_[a-z]+', p.stem))
    gallery = [image_asset(character, portrait, 'portrait', 'ポートレート'), image_asset(character, fullbody, 'fullbody', '全身ビジュアル'), image_asset(character, concept, 'concept', 'コンセプト3場面')]
    sheet = next(directory.glob('*visual_sheet.png'))
    gallery.append(image_asset(character, sheet, 'sheet', 'ビジュアルシート', existing_src=character['sheet']))
    if character['number'] <= 22:
        datasheet = next(p for p in directory.glob('*.png') if p.stem == directory.name)
        gallery.append(image_asset(character, datasheet, 'datasheet', 'キャラクターデータシート'))
    else:
        poster = next(directory.glob('*post?r.png'))
        gallery.append(image_asset(character, poster, 'poster', 'キャラクターポスター'))
    character['gallery'] = gallery

(ROOT / 'content/characters.json').write_text(json.dumps(characters, ensure_ascii=False, indent=2) + '\n')
(ROOT / 'docs/IP_MATERIALS.md').write_text('# IPキャラクターの素材セット\n\nユーザー指定の32charを読み取り専用で参照。2026-10-29添付のセラのMD・データシート・ポートレート・全身画像は元フォルダの同名ファイルとSHA256が一致しています。\n\n32人全員にポートレート、全身、3場面、ビジュアルシートを掲載。22人にキャラクターデータシート、残る10人にポスターを掲載。1人5種、計160種を参照できます。画像の文字・人物・構図は変更せず、WebPに変換し一覧用の小さな画像も作成しました。\n\nMDの基本情報、性格、欲求、弱点、話し方、台詞例、見た目、場面案を人物紹介に使用しています。未設定の年齢や台詞を創作しません。新しい画像が追加されていても、MDの場面設計を実際の配信作品・販売実績と読み替えません。ユーザーの依頼に従い、元のデータシート画像を全文掲載するため、画像内には企画段階の運用案も含まれます。本文には運営手順・市場調査・収益化案を転載していません。\n\n| キャラクター | 素材 | 元ファイル | SHA256 |\n|---|---|---|---|\n' + '\n'.join(records) + '\n')
print('Imported 32 detailed profiles and 160 gallery entries; source files unchanged.')
