# Third-party notices

本リポジトリはMIT Licenseの `nitoyon/pokesleep-tool` を固定commitのGit submoduleとして参照し、必要な型、計算部品、データ、React/MUI画面部品を配布用bundleへ含めます。

- Upstream: https://github.com/nitoyon/pokesleep-tool
- Pinned commit: `aec938d72d52fe875029aae13f58ae850db2fe98`
- Upstream copyright: Copyright (c) nitoyon and pokesleep-tool contributors
- License: MIT

ランキング独自実装は、MIT Licenseの旧 `takus69/pokesleep-tool` fork commit `42b0c4ae34c168ba8d6fbb3329d3426a452beb80` から本リポジトリへ移植し、その後拡張向けに変更しています。現在の正本は `src/features/ranking` であり、ビルド、テスト、実行時に旧forkのcheckoutを参照しません。

- Historical source: https://github.com/takus69/pokesleep-tool
- Fork modifications: Copyright (c) 2026 takus69
- Imported original paths: `src/fork/**`, `src/util/IngredientRanking.ts`, `src/util/NumericRanking.ts`, `src/util/PokemonRanking.ts`, `src/util/RankingScenario.ts` および対応テスト
- Current paths: `src/features/ranking/application`, `src/features/ranking/domain`, `src/features/ranking/ui`, `src/features/ranking/workspace`
- Material changes: 元ツール上段タブへの統合、計算環境とボックスの参照専用連携、明示的な再計算、実行時データ検証、公式上流APIへの追従

`src/vendor/upstream-data` は `scripts/sync-upstream-data.mjs` が公式元ツールの指定checkoutから取得した非実行JSONのスナップショットです。同期元commitとファイルハッシュは同ディレクトリのmanifestに記録します。実行時に取得する新しいJSONにも同じMIT Licenseと帰属を適用します。計算コードはViteが自己完結したcontent scriptへbundleし、実行時には取得しません。

PokémonおよびPokémon Sleepは各権利者の商標・著作物であり、本プロジェクトは公式提供物ではありません。
