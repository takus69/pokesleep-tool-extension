# Third-party notices

本リポジトリはMIT Licenseの `nitoyon/pokesleep-tool` および `takus69/pokesleep-tool` forkからランキング計算、型、データの一部をビルド時に参照し、配布用bundleへ含めます。参照元は `takus69/pokesleep-tool` commit `42b0c4ae` です。拡張独自のUIと実行環境を追加し、元のReact画面は含めていません。

- Upstream: https://github.com/nitoyon/pokesleep-tool
- Ranking fork: https://github.com/takus69/pokesleep-tool
- Upstream copyright: Copyright (c) nitoyon and pokesleep-tool contributors
- Fork modifications: Copyright (c) 2026 takus69
- License: MIT

対象は `src/util/RankingScenario.ts` とその推移的な計算依存、`src/data` の必要データ、および既定ランキング設定です。現在は隣接する読み取り専用forkを開発時に参照し、Viteが自己完結したcontent scriptへbundleします。ストア公開前に固定commitから再現可能に取得する仕組みへ置き換えます。

PokémonおよびPokémon Sleepは各権利者の商標・著作物であり、本プロジェクトは公式提供物ではありません。
