# Third-party notices

本リポジトリはMIT Licenseの `nitoyon/pokesleep-tool` および `takus69/pokesleep-tool` forkからランキング計算、型、データ、React/MUI画面をビルド時に参照し、配布用bundleへ含めます。参照元は `takus69/pokesleep-tool` commit `42b0c4ae` です。拡張側で上段タブ統合とChromium実行環境を追加しています。

- Upstream: https://github.com/nitoyon/pokesleep-tool
- Ranking fork: https://github.com/takus69/pokesleep-tool
- Upstream copyright: Copyright (c) nitoyon and pokesleep-tool contributors
- Fork modifications: Copyright (c) 2026 takus69
- License: MIT

対象は `src/fork/RankingWorkspace.tsx`、`src/fork/RankingScenarioView.tsx`、`src/fork/**` のランキングUI、`src/util/RankingScenario.ts` とその推移的な計算依存、`src/data` の必要データ、翻訳、および既定ランキング設定です。`src/features/ranking/workspace` の派生画面は、元ツール環境とボックスを参照専用にする変更を加えています。`src/features/ranking/workspace/useRankingScenario.ts` は同commitの `src/fork/useRankingScenario.ts` を基に、条件変更で実行中の計算を中止せず、明示操作時だけ計算を開始・置換するよう変更しています。`DynamicRankingPokemonSelect.tsx` は同commitの `src/fork/RankingPokemonSelect.tsx` を基に、実行時データで追加された名称のフォールバックを加えています。

`src/vendor/upstream-data` は `scripts/sync-upstream-data.mjs` が元ツールの指定checkoutから取得した非実行JSONのスナップショットです。同期元commitとファイルハッシュは同ディレクトリのmanifestに記録します。実行時に取得する新しいJSONにも同じMIT Licenseと帰属を適用します。計算コードは引き続きViteが自己完結したcontent scriptへbundleし、実行時には取得しません。

PokémonおよびPokémon Sleepは各権利者の商標・著作物であり、本プロジェクトは公式提供物ではありません。
