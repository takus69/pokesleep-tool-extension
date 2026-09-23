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

元ツールとのDOM、保存形式、計算、データ、UI部品、互換性の詳細な境界は [元ツール連携・互換性仕様](upstream-integration.md) を正本とします。

公式計算の再利用は、ブラウザ非依存の狭い計算ポートを `src/domain` に定義し、固定submoduleの計算クラスを呼ぶ実装を `src/integration` に置く方針です。計算式や共有条件の全schemaは複製しません。具体的な境界と現行コードからの移行状態は連携仕様を参照してください。
