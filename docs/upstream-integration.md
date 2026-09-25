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

元ツールの `PokemonBox` と `loadBoxSortConfig` を使って保存値を読み直し、ランキングにはスナップショットを渡します。比較用ボックスは上流の `sortPokemonItems` と表示時の昇順反転を適用し、元ツールで保存した並び順を再現します。上流の画面内だけで保持されるフィルターは対象外です。並び替えが計算できない場合は順序を推測せず、エラーを表示します。ランキング側は参照と比較対象の選択だけを行い、追加、編集、複製、削除、import、exportを行いません。

### 保存状態の所有権と共有方針

保存状態は、元ツールと共有する状態、元ツールから読み取るだけの状態、拡張機能が所有する状態に分けます。

| 区分 | 保存先・キー | 内容 | ランキングからの扱い |
|---|---|---|---|
| 元ツールと共有 | ページの `localStorage`: `PstStrenghParam` | フィールド、イベント、好きなきのみ、睡眠時間などの共有計算条件 | 読み取る。元ツールの画面を利用した明示的な条件変更は、元ツールと同じ保存処理で書き込む。 |
| 元ツールから読み取り専用 | ページの `localStorage`: `PstIvState` | 作業中の個体、選択中の個体、個体値計算画面内のタブ位置 | ランキングタブへ移動したときに個体を読み直す。ランキング内の個体編集・比較選択・下段タブ切替は元ツールの保存値へ書き込まない。元ツールとランキングの表示中の個体状態は別であり、即時同期しない。 |
| 元ツールから読み取り専用 | ページの `localStorage`: `PstPokeBox` | 元ツールのボックス登録内容 | 最新スナップショットを読み取るだけとし、ランキングから書き込まない。 |
| 元ツールから読み取り専用 | ページの `localStorage`: `PstPokemonBoxParam` | ボックスの並び順・昇降順など | 上流のloaderで最新設定を読み取り、ランキングから書き込まない。 |
| 拡張機能が所有 | ページの `localStorage`: `PstForkRankingScenarios.v1` | ランキング目的別の独自条件 | 元ツールの状態と分離して読み書きする。既存利用者との互換性のため、現行キー名を維持する。 |
| 拡張機能が所有 | `chrome.storage.local`: `settings.v1` | 拡張機能スイート内の機能ごとの有効・無効設定 | 拡張機能だけが読み書きする。現在の対象はランキングで、未設定時は機能側の既定値（有効）を使う。利用者向け設定画面は未実装。 |
| 拡張機能が所有 | `chrome.storage.local`: `upstream-data-pack.v1` | 検証済み上流データと確認時刻 | 拡張機能だけが検証後に読み書きする。元ツールの保存値として扱わない。 |
| 拡張機能が所有 | `chrome.storage.session`: `upstream-data-refresh-claimed.v1` | ブラウザセッション内で上流確認済みかどうか | 拡張機能だけが読み書きし、セッション終了後の保持を前提にしない。 |

元ツール所有の保存値については、拡張側で自動修復、削除、独自schemaへの置換を行いません。書き込みが必要な場合は元ツールの型、正規化、保存処理を利用し、対応する操作を上表で明示します。通常の共有計算条件は元ツール自身の画面で変更するため、同じ画面内のReact状態も更新されます。ただしランキングの個体フォームにある上流の「おてつだい頻度」詳細ダイアログは、キャンプチケット・おてつだいボーナス数を共有条件へ保存できる例外で、元ツール画面への即時反映は保証しません。上流の保存形式が変わった場合は互換性変更として扱い、固定submodule更新時にcontract testと実ブラウザ試験で確認します。

### 静的データ

公式元ツールは `vendor/pokesleep-tool` のGit submoduleで検証済みcommitに固定します。ポケモン、イベント、フィールドの同梱JSONは `src/vendor/upstream-data` に置き、manifestへ同期元commitとSHA-256を記録します。

対象ページをブラウザセッションで最初に開いたときだけ、公式リポジトリの `pokemon.json` と `event.json` を確認します。JSONをコードとして評価せず、既知の型、食材、スキル、イベント効果を検証してから一括適用します。
データキャッシュには同梱データの同期元commitも記録します。固定commitが異なるキャッシュや旧形式のキャッシュは削除・修復せず無視し、新しい同梱データを優先します。次のセッション初回の取得が成功すれば、検証済みデータでキャッシュを更新します。

## 3. 処理ロジック

ランキング独自の計算と状態は `src/features/ranking` で管理します。Chromium APIとDOMへ依存しない計算をdomainへ置きます。元ツールの純粋な計算型・関数はbundleへ含めて利用します。

### 共通計算境界

ランキング以外にも食材構成のシミュレーションを追加する前提で、`PokemonStrength.calculate()` を呼ぶ箇所には共通の薄い計算ポートを採用します。公式の計算式は固定submoduleの実装をそのまま使い、拡張側へ複製しません。`src/domain/PokemonCalculationPort.ts` が型付き契約を、`src/domain/UpstreamPokemonCalculation.ts` が公式クラスの生成と呼び出しを担います。両者はブラウザAPI、DOM、保存処理を持ちません。計算アダプターをdomainに置くことで、domainからintegrationへの逆向きの依存を避けます。ランキングの候補列挙、評価指標の選択、順位付けは引き続きランキング機能の責務です。

| 観点 | 採用する境界 |
|---|---|
| 入力 | 既存の `PokemonIv` と `StrengthParameter` を当面は型付きで受け渡す。共有計算条件の全項目を独自DTOへ複写しない。ランキング側で行う `level: 0` などの条件調整は呼び出し側に残す。 |
| 出力 | 利用機能に必要な食材名・個数と評価値だけを型付きで公開する。公式の巨大な `StrengthResult` 全体を共通契約にしない。 |
| エラー | 公式計算の例外や欠落した値から推測値を作らない。計算不能として呼び出し側へ伝え、ランキングは既存の除外理由と表示を維持する。 |
| テスト | 固定submoduleの実計算との代表ケースの一致、未知食材・未確定率などの計算不能、公式クラスの直接生成が機能コードへ増えないことを確認する。 |

この段階のポートは**計算クラスへの入口**を限定するもので、ポケモン候補生成や全上流型を中立化するものではありません。直接利用を続ける方が変換は少ないものの、計算クラスの変更点が各機能へ広がるため、入口のみを共通化します。一方、全計算条件・全結果の独自モデル化は公式schemaを二重管理し、更新時の不整合を増やすため採用しません。食材構成シミュレーションの具体的な入力・出力が決まった時点で、共通結果項目の追加が必要かを判断します。レシピ計算や候補列挙まで先取りして共通化しません。

最新JSONのdecode、検証、適用と、同梱データ・キャッシュ・ネットワークの選択手順は `src/integration` に置きます。この手順は型付きruntime portだけを利用します。取得先URL、`fetch`、Chrome Storage、service workerとのセッション判定は `src/runtime/chromium/upstreamDataPackRuntime.ts` と `public/background.js` に限定します。

元ツールのReact画面部品へのimportは `src/features/ranking/upstreamUi.ts`、保存処理を持つ状態reducerへのimportは `src/integration/upstreamIvState.ts` に集約します。機能コードから上流UI内部パスを直接importしないことを契約テストで検証します。DOM検出、タブ操作、表示退避、再描画監視、元ツール画面への遷移は `src/integration` に配置し、ランキングUIには型付きの操作だけを公開します。保存形式の知識もランキング条件の保存キーを除いて `src/integration` に置きます。

### ランキング詳細画面の上流UI境界

ランキングの個体詳細では、固定した公式版の `RpView`、`StrengthBerryIngSkillView`、`RatingView` を継続利用します。拡張側で同等の計算結果画面を複製しません。上流UIのimportは `upstreamUi.ts` を通し、個体と計算条件のスナップショットから作るプレビュー状態は `src/features/ranking/ui/RankingDetailPreviewState.ts` に閉じ込めます。プレビューは空のボックスを持ち、ボックス変更actionは受け付けません。上流の保存処理付き `ivStateReducer` はこのプレビューに接続しないため、詳細の閲覧・操作だけで元ツールの作業状態やボックスを保存しません。

固定上流版の変更時は、各Viewのprops、要求する状態項目、子コンポーネントからのaction、直接または間接の保存処理を確認します。契約テストでは3画面の描画とプレビュー操作中に保存値が変わらないことを検証します。上流UIが新たな状態・action・保存処理を要求する、または画面の整合性を保てなくなった場合は、この境界を見直します。公式UIをbundleへ含めるため、上流UIの変更は拡張本体の更新で取り込みます。

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
| 上流React UI・状態 | `src/features/ranking/upstreamUi.ts`、`src/integration/upstreamIvState.ts` | 画面部品と保存処理を持つ状態reducerを別の境界から公開 |
| 上流計算・データ | `src/domain/PokemonCalculationPort.ts`、`src/domain/UpstreamPokemonCalculation.ts`、`src/features/ranking/upstream.ts`、ranking domain | 公式計算クラスの入口と必要な結果の射影、型付き候補データ、ランキング独自の評価。 |
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

## 10. 疎結合監査

現行コードの固定上流commitは `ff2aaade69772789fb921462aec961deab303f8e` です。次の境界は、固定commit更新時にも継続して監視します。

| 依存 | 現在の境界 | 分類 | 上流変更時の影響・方針 |
|---|---|---|---|
| ポケモン・食材・スキル・イベントの型、データ、計算関数 | ranking domain、`upstream.ts`、`upstreamDataPack.ts`。計算クラスの生成は `src/domain/UpstreamPokemonCalculation.ts` に集約 | 必要なAsIs再利用 | 公式情報と計算式を二重管理しない。計算クラスの変更は共通アダプターと実計算の契約テストで確認する。候補データや上流型の変更は固定commit更新PRで型検査・計算テストにより追従する。 |
| 元ツールのReactフォーム、アイコン、詳細画面 | `upstreamUi.ts`、`RankingDetailPreviewState.ts` | 意図したAsIs再利用 | exportと詳細画面のprops・state・actionを境界で監視する。プレビューは保存処理付きreducerへ接続しない。bundle済みコードはページ再読み込みだけでは更新されず、拡張更新が必要。 |
| 上段タブ、表示退避、設定画面へのクリック | `src/integration` | 集約したDOM境界 | sticky構造、タブ位置、MUI class、再描画への依存をcontroller内に限定する。SPA再描画、タブ追加、選択状態復元をcontract testで監視する。 |
| 計算条件・ボックスの保存値 | `upstreamRankingInputs.ts` | 非公開保存形式への依存 | 元ツールdecoderと型を利用し、保存schemaと読み取り専用の動作をcontract testで監視する。ボックスは参照専用。 |
| 元ツールの `normalizeState` と保存処理付き `ivStateReducer` | `upstreamIvState.ts`、`RankingWorkspaceState.ts` | 個体の正規化と保存境界 | ランキング内の個体編集には上流の `normalizeState` だけを使い、保存処理付きreducerは呼ばない。比較個体の選択・下段タブ切替も `PstIvState` と `PstPokeBox` を書き込まない。明示的な計算条件変更だけは `PstStrenghParam` を保存する。操作別のstorage差分contract testで境界を監視する。 |
| ランキング条件の保存 | `RankingScenarioPersistence.ts` / `runtime/chromium/rankingScenarioStorage.ts` | 分離済み | application層はschema変換と保存ポートだけを定義し、ページの `localStorage` と既存キーはChromium runtimeが扱う。 |
| 最新JSONの取得、キャッシュ、セッション判定 | `upstreamDataPack.ts`、`upstreamDataPackRefresh.ts`、`runtime/chromium/upstreamDataPackRuntime.ts` | runtime portで分離済み | integrationはdecode、検証、適用、fallback順序を管理し、Chromium adapterだけが取得先URL、`fetch`、Chrome Storage、service workerメッセージを知る。境界テストで再混在を防止する。 |

監査で確認した改善課題と設計判断の内容、優先度、完了条件は[GitHub Issues](https://github.com/takus69/pokesleep-tool-extension/issues)で管理します。本書には現在有効な境界仕様と、上流更新時に継続して確認する依存関係を記載します。
