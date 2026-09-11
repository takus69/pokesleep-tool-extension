# アーキテクチャ

依存方向は `runtime → UI/features/settings/integration → domain` とし、domainからブラウザAPIへ依存しません。

| 層 | 場所 | 責務 |
|---|---|---|
| domain | `src/domain` | 実行環境に依存しない型・計算 |
| features | `src/features/<feature>` | 個別機能。独立して有効化・停止 |
| integration | `src/integration` | 元ツールのURL、DOM、保存形式を共通型へ変換 |
| settings | `src/settings` | 設定モデルと保存ポート／実装 |
| UI | `src/ui` | Shadow DOM内の共通UI |
| runtime | `src/runtime/chromium` | MV3エントリポイントとChrome API結線 |

各機能は `FeatureModule` を実装し、一意なID、既定の有効状態、mount/unmountを提供します。将来のSafariやブックマークレットではruntimeと保存実装を差し替え、domain、integrationの純粋変換、主要UIを再利用します。

初期版はcontent scriptだけで起動し、ページのJavaScript世界へコードを注入しません。UIはclosed Shadow DOMへ隔離します。互換性プローブに失敗した場合は機能をmountせず、推測値を表示しません。
