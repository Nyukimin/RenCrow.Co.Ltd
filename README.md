# RenCrow.Co.Ltd

有限会社RenCrowのキャラクター・クリエイションサイトの公開用リポジトリです。

## サイト概要

**RenCrow** は、AIキャラクターとIPキャラクター、そこから生まれる創作を紹介するポータルサイトです。

🌐 **Webサイト**: https://nyukimin.github.io/RenCrow.Co.Ltd/

### キャラクター（全41人）

| カテゴリ | 人数 | 紹介 |
|---------|------|------|
| **メインAI** | 4人 | Mio（ミオ）、Midori（ミドリ）、Shiro（シロ）、Kuro（クロ） |
| **お友達** | 1人 | Lumina（ルミナ） |
| **サブキャラクター** | 4人 | Aka（アカ）、Ao（アオ）、Kin（キン）、Gin（ギン） |
| **IPキャラクター** | 32人 | 日常からファンタジーまで、多彩な個性を持つキャラクターたち |

### 作品展開

- **Roblox Games** - 開発中のゲーム3作品を公開
- **Music / Books / Gravure / Video** - 順次展開予定

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
├── characters/         # 各キャラクターの個別ページ（全41人）
└── games/              # Robloxゲーム紹介ページ
```

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

---

© RenCrow Co., Ltd.
