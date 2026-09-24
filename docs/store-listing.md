# Chrome Web Store／Microsoft Edge Add-ons 掲載情報

初回提出候補は拡張バージョン `0.1.0` です。両ストアへ同一タグ・同一ZIPを提出します。掲載内容を変更する際は、manifest、プライバシー方針、実画面と矛盾しないか確認してください。

## 名称と対応言語

- 名称: Pokémon Sleep Tool Extension Suite（`_locales/ja/messages.json`と一致）
- 初回掲載言語: 日本語
- 対応環境: Windows／macOSのChrome、Edge
- 対象ページ: https://nitoyon.github.io/pokesleep-tool/

本拡張は元ツールおよびPokémon Sleepの非公式な追加機能であり、元ツール作者・ゲーム運営による提供、承認、提携を意味しません。将来機能を追加できる拡張スイートですが、初回公開で利用できる機能はランキングです。

## 短い説明

Pokémon Sleep Toolに、育成候補や手持ち個体を比較できるランキング機能を追加します。

Edgeの短い説明はmanifestが参照する日本語メッセージから表示されます。提出するZIPでも同じ文案を使用します。

## 詳細説明（日本語）

Pokémon Sleep Toolのページに「ランキング」タブを追加する非公式ブラウザ拡張です。元ツールの計算条件を使い、ポケモンの育成候補や手持ち個体を比較できます。元ツールのページを離れずに結果を確認できます。

サブスキル・性格、食材構成、きのみ要員、食材要員、スキル要員、選択中のマップに合う候補をランキングできます。結果には順位、同順位の条件、計算条件の要約、手持ち個体との比較を表示します。計算開始後は進捗と途中順位を表示し、条件を変更した場合は再計算が必要なことを知らせます。再計算は利用者がボタンを押したときだけ始まります。

ランキングは元ツールのボックスを参照しますが、ランキング画面からボックスの追加・編集・削除は行いません。元ツールの個体編集フォームや計算条件を操作した場合は、元ツール側の保存状態が変更されることがあります。

ランキング計算は端末内で実行します。対象ページをブラウザセッションで最初に開いたとき、元ツールが公開するポケモン・イベントJSONを確認し、既知の形式だけを利用します。利用者のボックスや計算条件を開発者へ送信しません。未知の計算仕様は推測で処理せず、影響を受ける箇所を除外または警告します。JavaScriptなどの実行コードを外部からダウンロードしません。

本拡張は非公式のファンメイドプロジェクトです。Pokémon Sleepおよび関係各社、元ツール作者による提供・承認・提携を受けたものではありません。

## プライバシー・サポート

- プライバシー方針URL: https://github.com/takus69/pokesleep-tool-extension/blob/main/docs/privacy.md
- サポート／問題報告URL: https://github.com/takus69/pokesleep-tool-extension/issues
- 利用者向けマニュアルURL: https://github.com/takus69/pokesleep-tool-extension/blob/main/docs/user-manual.md

報告にはブラウザ名・版、拡張の版、対象URL、表示されたエラーを記載してもらいます。ボックス内容や保存値の投稿は求めません。上記3 URLは認証なしのHTTP GETでいずれも`200 OK`を確認済みです。提出時には匿名ブラウザで表示も再確認します。

## 権限と通信の説明

| 権限・接続先 | 利用目的 |
| --- | --- |
| `storage` | 拡張の機能設定、検証済み公開JSONのキャッシュと確認状態を端末内に保存する。 |
| `https://nitoyon.github.io/pokesleep-tool/*` | このページだけにランキングタブを追加し、元ツールの計算条件とボックスを端末内で参照する。 |
| `https://raw.githubusercontent.com/nitoyon/pokesleep-tool/*` | 元ツールが公開するポケモン・イベントの非実行JSONを、ブラウザセッションの最初の対象ページ表示時に確認する。 |

広告、解析、追跡、開発者サーバーへの利用者データ送信は行いません。提出時のデータ利用申告は[`docs/privacy.md`](privacy.md)と一致させます。

## 画像素材と掲載順

| ストア | 素材 | リポジトリ内の場所 | 状態 |
| --- | --- | --- | --- |
| Chrome／Edge | 拡張アイコン | `public/icons/icon-128.png` | 作成済み |
| Edge | 掲載ロゴ | `assets/store/edge-logo-300.png` | 作成済み |
| Chrome／Edge | 小型紹介画像 | `assets/store/promo-small-440x280.png` | 作成済み |
| Chrome／Edge | 1枚目: ランキングタブ、計算条件要約、順位と候補 | `assets/store/screenshots/01-ranking.png` | 1280×800の実画面画像を作成済み |

画像の作成元と撮影条件は[`assets/store/README.md`](../assets/store/README.md)を参照してください。Chromeに必要な実画面スクリーンショット1枚を用意済みです。2枚目以降は任意とし、初回提出には含めません。

## 提出時の確認

- [ ] 公開候補の版・画面・文案が一致し、ChromeとEdgeで受入済み
- [x] 実画面スクリーンショットを原本とともに登録し、ボックス内容を含まないことを確認
- [x] プライバシー方針とサポートURLが認証なしのHTTP GETで開ける
- [ ] 各ストア管理画面の最新必須項目、画像要件、データ利用申告を確認
- [ ] 元ツール作者への拡張公開に関する確認とライセンス監査を別途完了

画像寸法と提出項目は[Chrome Web Storeの画像ガイド](https://developer.chrome.com/docs/webstore/images)、[掲載情報ガイド](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)、[Edge Add-onsの提出手順](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension)を参照。ストアの管理画面に更新があれば、提出時点の表示を優先します。
