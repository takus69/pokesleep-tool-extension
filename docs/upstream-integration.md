# 元ツール連携・互換性仕様

この文書を、公式 [Pokémon Sleep Tool](https://github.com/nitoyon/pokesleep-tool) と拡張機能の境界に関する唯一の詳細仕様とします。アーキテクチャ文書と各機能設計には概要だけを記載し、詳細は本書を参照します。

## 1. 目的と原則

- 対象は `https://nitoyon.github.io/pokesleep-tool/` 配下とする。
- 元ツールのDOM、保存形式、内部モジュールへの依存箇所を限定する。
- 元ツールの計算・データ・画面部品を利用し、公式情報を拡張側で重複管理しない。
- 必要な情報を検証できない場合はfail closedとし、推測した結果を表示しない。
- 元ツールの保存値を自動修復・削除しない。元ツールのAsIs UI操作で保存する経路は下記の監査結果で区別する。
- 実行コードを外部から取得しない。

## 2. 入力仕様

### ページとDOM

初期プローブは対象URLと `#root` を確認します。上段タブは個数や文言ではなく、sticky計算領域直下の最初のMUIタブ列として検出します。上段の階層契約を確認できない場合はランキングを挿入しません。

### 計算条件

`PstStrenghParam` を元ツール自身のdecoderで読み込みます。変更判定では生JSONをキー順に正規化し、ランキング側が置き換える `level`、`evolved`、`maxSkillLevel` だけを除外します。未知のイベント名も変更として検出します。

### ボックス

元ツールの `PokemonBox` を使って保存値を読み直し、ランキングにはスナップショットを渡します。ランキング側は参照と比較対象の選択だけを行い、追加、編集、複製、削除、import、exportを行いません。

### 保存状態の所有権と共有方針

保存状態は、元ツールと共有する状態、元ツールから読み取るだけの状態、拡張機能が所有する状態に分けます。

| 区分 | 保存先・キー | 内容 | ランキングからの扱い |
|---|---|---|---|
| 元ツールと共有 | ページの `localStorage`: `PstStrenghParam` | フィールド、イベント、好きなきのみ、睡眠時間などの共有計算条件 | 読み取る。元ツールの画面を利用した明示的な条件変更は、元ツールと同じ保存処理で書き込む。 |
| 元ツールと共有 | ページの `localStorage`: `PstIvState` | 作業中の個体、選択中の個体、個体値計算画面内のタブ位置 | 読み取り、ランキングでの個体編集や下段タブ操作による更新を許容する。ボックス登録とは区別し、元ツールとランキングを往復して確認できる一時的な作業状態として共有する。 |
| 元ツールから読み取り専用 | ページの `localStorage`: `PstPokeBox` | 元ツールのボックス登録内容 | 最新スナップショットを読み取るだけとし、ランキングから書き込まない。 |
| 拡張機能が所有 | ページの `localStorage`: `PstForkRankingScenarios.v1` | ランキング目的別の独自条件 | 元ツールの状態と分離して読み書きする。既存利用者との互換性のため、現行キー名を維持する。 |
| 拡張機能が所有 | `chrome.storage.local`: `settings.v1` | 拡張機能スイート内の機能ごとの有効・無効設定 | 拡張機能だけが読み書きする。現在の対象はランキングで、未設定時は機能側の既定値（有効）を使う。利用者向け設定画面は未実装。 |
| 拡張機能が所有 | `chrome.storage.local`: `upstream-data-pack.v1` | 検証済み上流データと確認時刻 | 拡張機能だけが検証後に読み書きする。元ツールの保存値として扱わない。 |
| 拡張機能が所有 | `chrome.storage.session`: `upstream-data-refresh-claimed.v1` | ブラウザセッション内で上流確認済みかどうか | 拡張機能だけが読み書きし、セッション終了後の保持を前提にしない。 |

元ツール所有の保存値については、拡張側で自動修復、削除、独自schemaへの置換を行いません。書き込みが必要な場合は元ツールの型、正規化、保存処理を利用し、対応する操作を上表で明示します。上流の保存形式が変わった場合は互換性変更として扱い、固定submodule更新時にcontract testと実ブラウザ試験で確認します。

### 静的データ

公式元ツールは `vendor/pokesleep-tool` のGit submoduleで検証済みcommitに固定します。ポケモン、イベント、フィールドの同梱JSONは `src/vendor/upstream-data` に置き、manifestへ同期元commitとSHA-256を記録します。

対象ページをブラウザセッションで最初に開いたときだけ、公式リポジトリの `pokemon.json` と `event.json` を確認します。JSONをコードとして評価せず、既知の型、食材、スキル、イベント効果を検証してから一括適用します。

## 3. 処理ロジック

ランキング独自の計算と状態は `src/features/ranking` で管理します。Chromium APIとDOMへ依存しない計算をdomainへ置きます。元ツールの純粋な計算型・関数はbundleへ含めて利用します。

元ツールのReact UIと状態へのimportは `src/features/ranking/upstreamUi.ts` に集約します。機能コードから上流UI内部パスを直接importしないことを契約テストで検証します。DOM検出、タブ操作、表示退避、再描画監視、元ツール画面への遷移は `src/integration` に配置し、ランキングUIには型付きの操作だけを公開します。保存形式の知識もランキング条件の保存キーを除いて `src/integration` に置きます。

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

## 10. 疎結合監査（2026-09-16）

現行コードを固定上流commit `aec938d72d52fe875029aae13f58ae850db2fe98` と照合した結果です。これらは改善候補の分類であり、今回の監査では動作を変更しません。

| 依存 | 現在の境界 | 分類 | 上流変更時の影響・方針 |
|---|---|---|---|
| ポケモン・食材・スキル・イベントの型、データ、計算関数 | ranking domain、`upstream.ts`、`upstreamDataPack.ts` | 必要なAsIs再利用 | 公式情報と計算式を二重管理しない。内部API変更は固定commit更新PRで型検査・計算テストにより追従する。 |
| 元ツールのReactフォーム、アイコン、詳細画面 | `upstreamUi.ts` | 意図したAsIs再利用 | exportの変更は境界モジュールへ集約済み。ただしbundle済みコードはページ再読み込みだけでは更新されず、拡張更新が必要。 |
| 上段タブ、表示退避、設定画面へのクリック | `src/integration` | 集約したDOM境界 | sticky構造、タブ位置、MUI class、再描画への依存をcontroller内に限定する。SPA再描画、タブ追加、選択状態復元をcontract testで監視する。 |
| 計算条件・ボックスの保存値 | `upstreamRankingInputs.ts` | 非公開保存形式への依存 | 元ツールdecoderと型を利用しているが、保存スキーマ変更に備えたfixture・異常値テストを強化する。ボックスは参照専用。 |
| 元ツールの `ivStateReducer` とその保存処理 | `RankingWorkspaceState.ts` | 意図した作業状態の共有 | ランキング内の個体編集、下段タブ切替等は `PstIvState`、明示的な計算条件変更は `PstStrenghParam` を保存する。ボックス本体とは分離された作業状態として共有し、上流更新時は保存対象が増えていないか監査する。 |
| ランキング条件の保存 | `RankingScenarioState.ts` | 実行環境依存 | `localStorage` をapplicationが直接利用する。保存ポートとschema変換を分け、既存キーの読み取り互換性を保つ。 |
| 最新JSONの取得、キャッシュ、セッション判定 | `upstreamDataPack.ts` | Chromium依存の混在 | 検証処理は再利用可能だが、同じファイルに `fetch`、`chrome.storage`、`chrome.runtime` がある。runtime portへ分ける。 |

監査で確認した改善課題と設計判断の内容、優先度、完了条件は[GitHub Issues](https://github.com/takus69/pokesleep-tool-extension/issues)で管理します。本書には現在有効な境界仕様と、上流更新時に継続して確認する依存関係を記載します。
