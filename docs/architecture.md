# アーキテクチャ

依存方向は `runtime → UI/features/settings/integration → domain` とし、domainからブラウザAPIへ依存しません。

| 層 | 場所 | 責務 |
|---|---|---|
| domain | `src/domain` | 実行環境に依存しない型・計算 |
| features | `src/features/<feature>` | 個別機能。独立して有効化・停止 |
| integration | `src/integration` | 元ツールのURL、DOM、保存形式を共通型へ変換 |
| settings | `src/settings` | 設定モデルと保存ポート／実装 |
| UI | `src/ui` | 共通UIのmount基盤 |
| runtime | `src/runtime/chromium` | MV3エントリポイントとChrome API結線 |

各機能は `FeatureModule` を実装し、一意なID、既定の有効状態、mount/unmountを提供します。将来のSafariやブックマークレットではruntimeと保存実装を差し替え、domain、integrationの純粋変換、主要UIを再利用します。

初期版はcontent scriptだけで起動し、ページのJavaScript世界へコードを注入しません。fork版ランキングはMUIのスタイル、ダイアログ、元ページとの視覚的一貫性を保つため、専用host要素のlight DOMへmountします。上流DOMを参照する処理はintegration層に限定します。互換性プローブに失敗した場合は機能をmountせず、推測値を表示しません。

計算コードは検証した上流・forkのcommitから拡張bundleへ含め、実行時には取得しません。ポケモンとイベントの非実行JSONは、同梱スナップショットを安全な基準とし、対象ページをブラウザセッションで最初に開いたときだけ元ツールのGitHubリポジトリへ最新版を確認します。取得データはintegration層で既知の型、食材、スキル、イベント効果へ限定して検証し、全体を検証してからメモリ上のデータを一括更新します。未知の仕組みを含む項目だけを除外し、同梱データとキャッシュは常にフォールバックとして残します。
