# Third-party notices

本リポジトリは `nitoyon/pokesleep-tool` を固定commitのGit submoduleとして参照し、必要な型、計算部品、データ、React/MUI画面部品を配布用bundleへ含めます。上流READMEにはライセンスがMITと記載されています。固定commitに独立したLICENSEファイルはありません。上流の著作権表示・許諾本文に関する確認状況は [ライセンス監査](docs/license-audit.md) に記載します。

- Upstream: https://github.com/nitoyon/pokesleep-tool
- Pinned commit: `ff2aaade69772789fb921462aec961deab303f8e`
- Upstream license statement: `README.md` の `## License` に `MIT`
- Separate upstream LICENSE file: 固定commitにはなし

上流の `src/ui/Resources` には、次の個別のMITライセンス表示があります。ランキングで利用する元ツール部品はこれらのアイコンを参照するため、制作者の表示を保持します。

- Copyright (c) 2024 ちゃんりわ: `AppleIcon`, `CacaoIcon`, `CoffeeIcon`, `CookingAssistIcon`, `CornIcon`, `EggIcon`, `GingerIcon`, `HerbIcon`, `HoneyIcon`, `HyperCutterIcon`, `IngredientDrawIcon`, `IngredientsIcon`, `LeekIcon`, `MilkIcon`, `MushroomIcon`, `OilIcon`, `PotatoIcon`, `SausageIcon`, `SoyIcon`, `SuperLuckIcon`, `TailIcon`, `TomatoIcon`
- Copyright (c) 2025 ちゃんりわ: `AvocadoIcon`, `PumpkinIcon`

上記のアイコンに適用される許諾本文は次のとおりです。

> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

ランキング独自実装は、MIT Licenseの旧 `takus69/pokesleep-tool` fork commit `42b0c4ae34c168ba8d6fbb3329d3426a452beb80` から本リポジトリへ移植し、その後拡張向けに変更しています。現在の正本は `src/features/ranking` であり、ビルド、テスト、実行時に旧forkのcheckoutを参照しません。

- Historical source: https://github.com/takus69/pokesleep-tool
- Fork modifications: Copyright (c) 2026 takus69
- Imported original paths: `src/fork/**`, `src/util/IngredientRanking.ts`, `src/util/NumericRanking.ts`, `src/util/PokemonRanking.ts`, `src/util/RankingScenario.ts` および対応テスト
- Current paths: `src/features/ranking/application`, `src/features/ranking/domain`, `src/features/ranking/ui`, `src/features/ranking/workspace`
- Material changes: 元ツール上段タブへの統合、計算環境とボックスの参照専用連携、明示的な再計算、実行時データ検証、公式上流APIへの追従

`src/vendor/upstream-data` は `scripts/sync-upstream-data.mjs` が公式元ツールの指定checkoutから取得した非実行JSONのスナップショットです。同期元commitとファイルハッシュは同ディレクトリのmanifestに記録します。元ツールREADMEのMIT表記がデータJSONへ適用される範囲は公開前に確認します。計算コードはViteが自己完結したcontent scriptへbundleし、実行時には取得しません。

PokémonおよびPokémon Sleepは各権利者の商標・著作物であり、本プロジェクトは公式提供物ではありません。
