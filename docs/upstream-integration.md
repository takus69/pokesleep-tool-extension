# 元ツール連携・互換性仕様

この文書を、公式 [Pokémon Sleep Tool](https://github.com/nitoyon/pokesleep-tool) と拡張機能の境界に関する唯一の詳細仕様とします。アーキテクチャ文書と各機能設計には概要だけを記載し、詳細は本書を参照します。

## 1. 目的と原則

- 対象は `https://nitoyon.github.io/pokesleep-tool/` 配下とする。
- 元ツールのDOM、保存形式、内部モジュールへの依存箇所を限定する。
- 元ツールの計算・データ・画面部品を利用し、公式情報を拡張側で重複管理しない。
- 必要な情報を検証できない場合はfail closedとし、推測した結果を表示しない。
- 元ツールの保存値を自動修復・上書きしない。
- 実行コードを外部から取得しない。

## 2. 入力仕様

### ページとDOM

初期プローブは対象URLと `#root` を確認します。上段タブは個数や文言ではなく、sticky計算領域直下の最初のMUIタブ列として検出します。上段の階層契約を確認できない場合はランキングを挿入しません。

### 計算条件

`PstStrenghParam` を元ツール自身のdecoderで読み込みます。変更判定では生JSONをキー順に正規化し、ランキング側が置き換える `level`、`evolved`、`maxSkillLevel` だけを除外します。未知のイベント名も変更として検出します。

### ボックス

元ツールの `PokemonBox` を使って保存値を読み直し、ランキングにはスナップショットを渡します。ランキング側は参照と比較対象の選択だけを行い、追加、編集、複製、削除、import、exportを行いません。

### 静的データ

公式元ツールは `vendor/pokesleep-tool` のGit submoduleで検証済みcommitに固定します。ポケモン、イベント、フィールドの同梱JSONは `src/vendor/upstream-data` に置き、manifestへ同期元commitとSHA-256を記録します。

対象ページをブラウザセッションで最初に開いたときだけ、公式リポジトリの `pokemon.json` と `event.json` を確認します。JSONをコードとして評価せず、既知の型、食材、スキル、イベント効果を検証してから一括適用します。

## 3. 処理ロジック

ランキング独自の計算と状態は `src/features/ranking` で管理します。Chromium APIとDOMへ依存しない計算をdomainへ置きます。元ツールの純粋な計算型・関数はbundleへ含めて利用します。

元ツールのReact UIと状態へのimportは `src/features/ranking/upstreamUi.ts` に集約します。機能コードから上流UI内部パスを直接importしないことを契約テストで検証します。DOM、画面遷移、保存形式の知識は `src/integration` に配置します。

## 4. 出力仕様

- 元ツールの上段タブ末尾へ「ランキング」を追加する。
- ランキング選択時は上段タブを残し、元ツールの計算表示・編集領域をランキング画面へ切り替える。
- 元ツールのタブへ戻ると退避した表示状態を復元する。
- 計算条件とボックスはランキングを開くたびに最新スナップショットへ更新する。
- 計算済み結果には計算開始時点の条件要約を保持する。
- 条件変更後は古い結果を残して再計算が必要なことを表示し、自動計算しない。

## 5. 画面・イベント連携

ランキングタブの選択状態、色、インジケーターは元ツールのタブと同時に有効にならないよう制御します。「計算条件を編集」は元ツール自身のタブをクリックし、元ツールのReactイベント処理を利用します。上流Reactの再描画は `MutationObserver` で検知し、現在の表示モードを再適用します。

ページのJavaScript worldへコードを注入せず、content scriptのisolated worldからDOMイベントで連携します。

## 6. コード上の境界

| 境界 | 場所 | 責務 |
|---|---|---|
| URL・DOM・保存形式 | `src/integration` | 検出、decode、スナップショット、画面遷移 |
| 上流React UI | `src/features/ranking/upstreamUi.ts` | 上流内部exportをランキング向けに限定して公開 |
| 上流計算・データ | `src/features/ranking/upstream.ts`、ranking domain | 型付き計算と候補データ |
| Chromium実行環境 | `src/runtime/chromium` | content script、service worker、Chrome API |
| ランキング独自実装 | `src/features/ranking` | 条件、計算、表示、機能内状態 |

## 7. Chromium拡張固有仕様

Manifest V3を使用し、対象サイトと検証済みJSON取得先だけにhost permissionを限定します。設定と検証済みデータキャッシュにはChrome Storageを使用します。manifest、permissions、content script、service workerは `src/runtime/chromium` または `public` のビルド入力で管理します。

## 8. 互換性検出とエラー動作

- URL、root、上段タブ、保存値を段階的に検査する。
- 保存値の破損や必須DOM欠落時は機能を起動しない。
- データ更新全体が不正なら検証済みキャッシュまたは同梱データへ戻す。
- 未知仕様が一部だけなら、影響するポケモン、イベント、指標だけを除外する。
- 未対応イベントは効果を適用しないことを計算前と結果表示中に警告する。
- 利用者にはページ再読み込み、拡張更新、解消しない場合の問題報告を順に案内する。

## 9. 上流更新手順

1. 固定submodule commitと公式最新版の差分を確認する。
2. データ、計算API、UI export、DOM、保存形式への影響を分類する。
3. submodule更新と必要な追従修正を同じPRに含める。
4. adapter contract test、ranking domain test、`npm run verify` を実行する。
5. unpacked `dist` をChromeとEdgeで受入確認する。
6. 対応した公式commitをリリースノートへ記録する。

新しいJSONだけで対応できるポケモンとイベントはデータ同期で反映できます。新スキル、新しい計算式、保存形式、DOMまたはUI exportの変更は拡張本体の更新対象です。

## 10. 未決事項

- 上流計算クラスをさらに中立的なdomain portで包むかは、料理シミュレーション等との共通利用範囲を見て判断する。
- 上流UIを利用する詳細画面を独自UIへ置換するかは、保守コストと視覚的一貫性を比較して判断する。
