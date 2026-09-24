# Chrome Web Store／Microsoft Edge Add-ons 掲載情報

## 掲載文（日本語）

### タイトル

Pokémon Sleep Tool Extension Suite

### 短い説明

「個体値計算機 for ポケモンスリープ」に、育成候補や手持ち個体を比較できるランキング機能を追加します。

### 詳細説明

「個体値計算機 for ポケモンスリープ」（Pokémon Sleep Tool）に「ランキング」タブを追加する非公式ブラウザ拡張です。

元ツールの計算条件を利用して、ポケモンの育成候補や手持ち個体をランキング形式で比較できます。元ツールのページを離れずに結果を確認できます。

#### 主な機能

- サブスキル・性格を考慮したランキング
- 食材構成による比較
- きのみ要員・食材要員・スキル要員ごとの比較
- 選択中のマップに合わせた候補の比較
- 手持ち個体との比較
- 計算条件の要約表示
- 計算中の進捗・途中順位の表示

計算条件を変更した場合は、再計算が必要であることを表示します。再計算は利用者がボタンを押したときに実行されます。

ランキングではPokémon Sleep Toolのボックス情報を参照しますが、ランキング画面からボックスの追加・編集・削除は行いません。計算条件や個体編集フォームの変更は、元ツール側に保存される場合があります。

#### データとプライバシー

ランキング計算は利用者の端末内で行います。

本拡張は、ランキング条件、ボックス内容などの利用者データを開発者へ送信しません。広告、アクセス解析、利用者追跡も行いません。

新しいポケモンやイベントへの対応のため、Pokémon Sleep Toolが公開しているポケモン・イベントのJSONデータを確認する場合があります。この通信に利用者のボックス内容やランキング条件は含まれません。

新データに未対応の仕様がある場合は、誤った結果を避けるため、該当項目を除外するか警告を表示します。

JavaScriptなどの実行コードを外部からダウンロードして実行することはありません。

#### 対応環境

- Google Chrome
- Microsoft Edge
- Windows／macOS
- 対象サイト: [個体値計算機 for ポケモンスリープ](https://nitoyon.github.io/pokesleep-tool/iv/index.ja.html)

#### 非公式プロジェクトについて

本拡張は非公式のファンメイドプロジェクトです。

Pokémon Sleep、関係各社、およびPokémon Sleep Tool作者による提供、承認、提携を受けたものではありません。

#### プライバシー・サポート

- [プライバシー方針](https://github.com/takus69/pokesleep-tool-extension/blob/main/docs/privacy.md)
- [問題報告・サポート](https://github.com/takus69/pokesleep-tool-extension/issues)
- [利用者向けマニュアル](https://github.com/takus69/pokesleep-tool-extension/blob/main/docs/user-manual.md)

## 提出管理（掲載文には含めない）

初回提出候補は拡張バージョン `0.1.0` です。両ストアへ同一タグ・同一ZIPを提出します。初回掲載言語は日本語です。Edgeの短い説明はmanifestが参照する`_locales/ja/messages.json`の文案を使用します。

報告にはブラウザ名・版、拡張の版、対象URL、表示されたエラーを記載してもらいます。ボックス内容や保存値の投稿は求めません。上記3 URLは認証なしのHTTP GETでいずれも`200 OK`を確認済みです。提出時には匿名ブラウザで表示も再確認します。

### 権限と通信の説明

| 権限・接続先 | 利用目的 |
| --- | --- |
| `storage` | 拡張の機能設定、検証済み公開JSONのキャッシュと確認状態を端末内に保存する。 |
| `https://nitoyon.github.io/pokesleep-tool/*` | このページだけにランキングタブを追加し、元ツールの計算条件とボックスを端末内で参照する。 |
| `https://raw.githubusercontent.com/nitoyon/pokesleep-tool/*` | 元ツールが公開するポケモン・イベントの非実行JSONを、ブラウザセッションの最初の対象ページ表示時に確認する。 |

提出時のデータ利用申告は[`docs/privacy.md`](privacy.md)と一致させます。

### 画像素材と掲載順

| ストア | 素材 | リポジトリ内の場所 | 状態 |
| --- | --- | --- | --- |
| Chrome／Edge | 拡張アイコン | `public/icons/icon-128.png` | 作成済み |
| Edge | 掲載ロゴ | `assets/store/edge-logo-300.png` | 作成済み |
| Chrome／Edge | 小型紹介画像 | `assets/store/promo-small-440x280.png` | 作成済み |
| Chrome／Edge | 1枚目: ランキングタブ、計算条件要約、順位と候補 | `assets/store/screenshots/01-ranking.png` | 1280×800の実画面画像を作成済み |

画像の作成元と撮影条件は[`assets/store/README.md`](../assets/store/README.md)を参照してください。Chromeに必要な実画面スクリーンショット1枚を用意済みです。2枚目以降は任意とし、初回提出には含めません。

### 提出時の確認

- [ ] 公開候補の版・画面・文案が一致し、ChromeとEdgeで受入済み
- [x] 実画面スクリーンショットを原本とともに登録し、ボックス内容を含まないことを確認
- [x] プライバシー方針とサポートURLが認証なしのHTTP GETで開ける
- [ ] 各ストア管理画面の最新必須項目、画像要件、データ利用申告を確認
- [ ] 元ツール作者への拡張公開に関する確認とライセンス監査を別途完了

画像寸法と提出項目は[Chrome Web Storeの画像ガイド](https://developer.chrome.com/docs/webstore/images)、[掲載情報ガイド](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)、[Edge Add-onsの提出手順](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension)を参照。ストアの管理画面に更新があれば、提出時点の表示を優先します。
