# ライセンス監査

本書は配布物の出所、ライセンス表示と確認方法を記録する技術的な監査です。法的な許諾判断を代替しません。

## 本リポジトリと上流

| 対象 | 確認できた根拠 | 現在の扱い |
|---|---|---|
| 拡張の独自コード・文書 | ルートの `LICENSE` | `takus69` のMITライセンス。元ツールの著作権をこの表示に含めない。 |
| 公式元ツールのコード・データ・画面部品 | 固定commit `06569f6aeb1d3b9207208b45b27616e5a1f66d95` の `README.md` は `## License` に `MIT` と記載 | `vendor/pokesleep-tool` を読み取り専用のsubmoduleとして参照し、必要な部分をbundleへ含める。固定commitに独立したLICENSE本文はない。出典と確認できたライセンス表示を `THIRD_PARTY_NOTICES.md` に記載する。 |
| 元ツール内の一部アイコン | `vendor/pokesleep-tool/src/ui/Resources` の24ファイルの先頭に、制作者・年とMIT本文を明記 | `THIRD_PARTY_NOTICES.md` に個別表示を収録する。 |
| 旧forkから移した独自ランキング | 旧fork commit `42b0c4ae34c168ba8d6fbb3329d3426a452beb80` と `THIRD_PARTY_NOTICES.md` | 独自変更部分と上流由来部分の帰属を混同しない。旧forkは実行時の依存ではない。 |
| bundle内のnpm依存 | ビルドのmodule一覧から40パッケージを特定。インストール済みの版ではMIT 38件、BSD-3-Clause 2件 | `THIRD_PARTY_PACKAGE_LICENSES.md` をビルド時に生成し、各パッケージの許諾ファイルを収録する。ライセンス表記か本文がない場合はビルドを失敗させる。更新時に再監査する。 |
| UXWing由来アイコン | 上流の `src/ui/Resources/DreamShardIcon.tsx` が [Sparkle Icon](https://uxwing.com/sparkle-icon/) を出所として明記 | [UXWingの利用条件](https://uxwing.com/license/)をMITとは別に扱い、アプリ内での利用と素材そのものの再配布を区別する。 |
| ポケモン風アイコンデータ | 上流の `src/ui/IvCalc/PokemonIconData.ts` と `PokemonIcon.tsx` | コード化された形状データをbundleに含める。ストア掲載画像への利用やキャラクターの権利は、上流コードのMIT表記と別に確認する。 |
| ストア用アイコン・紹介画像 | 利用者が提示したデザイン案を画像生成ツールで調整した `assets/store/icon-master.png` と、`scripts/render-store-art.ps1` から作るPNG。作成手順は `assets/store/README.md` | 月・王冠・リングの独自図案で、元ツールやゲームの公式画像・ロゴを使わない。AI生成素材の利用条件とストアの画像ポリシーは提出時に確認する。 |
| ストア用実画面画像 | 利用者が対象ページで撮影した `assets/store/screenshots/source/01-ranking-2x.png` と50%縮小版 | 元ツールの画面・データ由来の図形が写るため、独自アイコンとは別に権利と掲載可否を確認する。 |

ビルドは上流コードを `dist/content.js` へ同梱します。配布ZIPには、ルートの `LICENSE` と `THIRD_PARTY_NOTICES.md` を同じ内容で含め、実際にbundleされたnpmパッケージの通知を `THIRD_PARTY_PACKAGE_LICENSES.md` に生成します。`npm run build` がこれらを検証します。拡張独自のアイコンは `dist/icons` に含まれ、元ツールの画面部品・SVG形状・ポケモン風アイコンデータは `content.js` 内に含まれます。ソース公開だけをもって配布ZIP内の通知に代えません。

## 公開・更新時の確認事項

1. 上流の出典・ライセンス表示と、配布物内の通知を照合する。不明な権利事項が残る場合はIssueで追跡し、解消前にストアへ提出しない。
2. ストア用の独自アイコン・紹介画像と実画面スクリーンショットを区別し、提出前に利用条件と掲載可否を確認する。元ツールの画面から任意設定により外部URLの画像を読み込む経路と、拡張ZIPに同梱する素材も区別する。
3. npm依存を更新した際は生成されたライセンス一覧の差分をレビューし、未知のライセンスや別条件の素材を確認する。
4. Pokémon/Pokémon Sleepの名称、キャラクター画像、ストア用アイコン・スクリーンショットは、元ツールのMIT表記だけで利用可能とは判断しない。初回掲載素材と非公式表示は [Issue #12](https://github.com/takus69/pokesleep-tool-extension/issues/12) で管理した。今後の素材変更時も別途確認する。
5. 本文・実装・配布ZIPを照合し、残る権利上の不明点を公開判断者へ提示する。
