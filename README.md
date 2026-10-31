# RenCrow.Co.Ltd

有限会社RenCrowのキャラクター・クリエイションサイトの公開用リポジトリです。

## 概要

**RenCrow** は、AIキャラクター・IPキャラクターと、そこから生まれる創作を紹介するポータルサイトです。

- **メインAIキャラクター**: Mio（ミオ）、Midori（ミドリ）、Shiro（シロ）、Kuro（クロ）
- **お友達**: Lumina（ルミナ）
- **サブキャラクター**: Aka（アカ）、Ao（アオ）、Kin（キン）、Gin（ギン）
- **IPキャラクター**: 32人のオリジナルキャラクター

ゲーム、音楽、書籍、グラビア、動画など、キャラクターから広がる作品を展開しています。

## Webサイト

https://nyukimin.github.io/RenCrow.Co.Ltd/

## ディレクトリ構成

```
RenCrow.Co.Ltd/
├── index.html          # トップページ
├── 404.html            # 404エラーページ
├── styles.css          # スタイルシート
├── app.js              # キャラクターフィルター・検索
├── viewer.js           # 画像ビューワー
├── favicon.svg         # ファビコン
├── sitemap.xml         # サイトマップ
├── robots.txt          # クローラー制御
├── .nojekyll           # GitHub Pages Jekyll無効化
├── assets/
│   ├── characters/     # キャラクター画像（ポートレート・シート）
│   └── games/          # ゲームスクリーンショット
├── characters/         # 各キャラクターの個別ページ
│   ├── mio/
│   ├── midori/
│   ├── shiro/
│   ├── kuro/
│   ├── lumina/
│   └── ... (全41キャラクター)
└── games/              # Robloxゲーム紹介ページ
    └── index.html
```

## コンテンツ

### キャラクター（41人）

| カテゴリ | 人数 | キャラクター |
|---------|------|-------------|
| メインAI | 4人 | Mio, Midori, Shiro, Kuro |
| お友達 | 1人 | Lumina |
| サブキャラクター | 4人 | Aka, Ao, Kin, Gin |
| IPキャラクター | 32人 | SERA, SENA, YURA 他 |

### Robloxゲーム（開発中）

1. **Last Bag Delivery（最後のひと袋）** - 約4分のソロ配達ゲーム
2. **Blackout Rooftop（屋上停電防衛隊）** - 約5分の3ウェーブ防衛ゲーム
3. **Wash & Reveal（洗って、発見。）** - 約5分の洗浄・修復ゲーム

## 技術仕様

- **ホスティング**: GitHub Pages
- **フレームワーク**: 静的HTML/CSS/JavaScript（ビルドツール不要）
- **セキュリティ**: Content-Security-Policy、no-referrer設定
- **アクセシビリティ**: WAI-ARIA、スキップリンク、キーボード操作対応
- **画像形式**: WebP（軽量・高品質）

## リポジトリの位置づけ

このリポジトリは**静的配信専用**です。

- ✅ ビルド済みHTML・CSS・JavaScript・画像のみを配置
- ❌ 内部資料・生成プロンプト・秘密情報は含めない

### 関連リポジトリ

RenCrowプロジェクトの関連リポジトリ:

| リポジトリ | 概要 |
|-----------|------|
| [RenCrow_CORE](https://github.com/Nyukimin/RenCrow_CORE) | コアシステム |
| [RenCrow_ASSISTANT](https://github.com/Nyukimin/RenCrow_ASSISTANT) | アシスタント機能 |
| [RenCrow_PORTAL](https://github.com/Nyukimin/RenCrow_PORTAL) | ポータル関連 |
| [RenCrow_EcoSystem](https://github.com/Nyukimin/RenCrow_EcoSystem) | エコシステム |
| [RenCrow_Harness](https://github.com/Nyukimin/RenCrow_Harness) | 開発ハーネス |
| [RenCrow_Switch_Core](https://github.com/Nyukimin/RenCrow_Switch_Core) | スイッチコア |
| [RenCrow_SuperWhisper](https://github.com/Nyukimin/RenCrow_SuperWhisper) | 音声認識関連 |
| [RenCrow_GPT120B](https://github.com/Nyukimin/RenCrow_GPT120B) | LLM関連 |

## ローカルでの確認方法

```bash
# リポジトリをクローン
git clone https://github.com/Nyukimin/RenCrow.Co.Ltd.git
cd RenCrow.Co.Ltd

# ローカルサーバーで確認（Python 3の場合）
python3 -m http.server 8000

# ブラウザで開く
# http://localhost:8000/
```

> **注意**: GitHub Pages用のパス設定（`/RenCrow.Co.Ltd/`）のため、ローカルではリンクが正しく動作しない場合があります。

## ライセンス

© RenCrow Co., Ltd. All Rights Reserved.

本リポジトリのコンテンツ（キャラクター画像・テキスト・デザイン）の著作権は有限会社RenCrowに帰属します。無断転載・二次利用を禁止します。

---

有限会社RenCrow
