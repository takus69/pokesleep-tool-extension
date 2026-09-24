# ストア画像素材

画像は本リポジトリ用に作成した棒グラフの図形です。元ツールやゲームの画像・ロゴは使用していません。作成元は [`scripts/render-store-art.ps1`](../../scripts/render-store-art.ps1) で、Windows PowerShellとSystem.Drawingを使ってPNGを再生成できます。

| ファイル | 用途 | サイズ |
| --- | --- | --- |
| `../../public/icons/icon-128.png` | 拡張ZIP内のChromeアイコン | 128×128、周囲16px透明 |
| `edge-logo-300.png` | Edge Add-ons掲載ロゴ | 300×300 |
| `promo-small-440x280.png` | Chrome Web Storeの小型紹介画像、Edgeの任意紹介画像 | 440×280 |

16px・48pxの拡張アイコンも同じスクリプトで生成し、`public/icons/`へ置きます。`npm run test:store-assets`でPNG寸法とmanifestの参照を確認します。

実画面スクリーンショットはデザイン画像で代用しません。公開候補のunpacked版を対象ページで動かし、ボックス内容など利用者の個人データを映さず、ランキング画面を1280×800で撮影します。スクリーンショットは角丸・余白・装飾を付けず、`assets/store/screenshots/`に原本を置き、掲載順と説明文を[`docs/store-listing.md`](../../docs/store-listing.md)へ記録します。

画像寸法は[Chrome Web Storeの公式ガイド](https://developer.chrome.com/docs/webstore/images)と[Microsoft Edge Add-onsの提出手順](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension)に基づきます。提出時には各管理画面の最新要件も確認してください。
