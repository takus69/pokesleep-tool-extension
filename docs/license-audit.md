# 公開前ライセンス監査

本書は配布物の出所と未解決事項を記録する技術的な監査です。法的な許諾判断を代替しません。未解決事項は [Issue #32](https://github.com/takus69/pokesleep-tool-extension/issues/32) で追跡し、解消前にストアへ提出しません。

## 本リポジトリと上流

| 対象 | 確認できた根拠 | 現在の扱い |
|---|---|---|
| 拡張の独自コード・文書 | ルートの `LICENSE` | `takus69` のMITライセンス。元ツールの著作権をこの表示に含めない。 |
| 公式元ツールのコード・データ・画面部品 | 固定commit `ff2aaade69772789fb921462aec961deab303f8e` の `README.md` は `## License` に `MIT` と記載。作者は公開forkへのランキング機能追加についてライセンス上問題ない旨を返信している（下記参照） | `vendor/pokesleep-tool` を読み取り専用のsubmoduleとして参照し、必要な部分をbundleへ含める。固定commitに独立したLICENSE本文はない。forkへの回答と、拡張bundle・ストア配布の範囲は区別して記録する。 |
| 元ツール内の一部アイコン | `vendor/pokesleep-tool/src/ui/Resources` の24ファイルの先頭に、制作者・年とMIT本文を明記 | `THIRD_PARTY_NOTICES.md` に個別表示を収録する。 |
| 旧forkから移した独自ランキング | 旧fork commit `42b0c4ae34c168ba8d6fbb3329d3426a452beb80` と `THIRD_PARTY_NOTICES.md` | 独自変更部分と上流由来部分の帰属を混同しない。旧forkは実行時の依存ではない。 |
| bundle内のnpm依存 | ビルドのmodule一覧から40パッケージを特定。インストール済みの版ではMIT 38件、BSD-3-Clause 2件 | `THIRD_PARTY_PACKAGE_LICENSES.md` をビルド時に生成し、各パッケージの許諾ファイルを収録する。ライセンス表記か本文がない場合はビルドを失敗させる。更新時に再監査する。 |
| UXWing由来アイコン | 上流の `src/ui/Resources/DreamShardIcon.tsx` が [Sparkle Icon](https://uxwing.com/sparkle-icon/) を出所として明記 | [UXWingの利用条件](https://uxwing.com/license/)をMITとは別に扱い、アプリ内での利用と素材そのものの再配布を区別する。 |
| ポケモン風アイコンデータ | 上流の `src/ui/IvCalc/PokemonIconData.ts` と `PokemonIcon.tsx` | コード化された形状データをbundleに含める。ストア掲載画像への利用やキャラクターの権利は、上流コードのMIT表記と別に確認する。 |
| ストア用アイコン・紹介画像 | 利用者が提示したデザイン案を画像生成ツールで調整した `assets/store/icon-master.png` と、`scripts/render-store-art.ps1` から作るPNG。作成手順は `assets/store/README.md` | 月・王冠・リングの独自図案で、元ツールやゲームの公式画像・ロゴを使わない。AI生成素材の利用条件とストアの画像ポリシーは提出時に確認する。 |
| ストア用実画面画像 | 利用者が対象ページで撮影した `assets/store/screenshots/source/01-ranking-2x.png` と50%縮小版 | 元ツールの画面・データ由来の図形が写るため、独自アイコンとは別に権利と掲載可否を確認する。 |

ビルドは上流コードを `dist/content.js` へ同梱します。配布ZIPには、ルートの `LICENSE` と `THIRD_PARTY_NOTICES.md` を同じ内容で含め、実際にbundleされたnpmパッケージの通知を `THIRD_PARTY_PACKAGE_LICENSES.md` に生成します。`npm run build` がこれらを検証します。現時点の `dist` には独立した画像ファイルはなく、画面部品・SVG形状・ポケモン風アイコンデータは `content.js` 内に含まれます。ソース公開だけをもって配布ZIP内の通知に代えません。

### 作者からの既存回答

公式リポジトリの [Discussion #23](https://github.com/nitoyon/pokesleep-tool/discussions/23) で、ユーザーは公開forkへのランキング機能追加とライセンスへの懸念を説明し、元ツール作者 `nitoyon` はライセンス上問題なく自由に拡張できる旨を返信しています。ユーザーが共有したGitHub画面で、同Discussionのコメントと返信を確認しました。公開forkへの機能追加を認める回答として記録しますが、当時の質問・回答は拡張bundleへのコード・データ同梱やChrome/Edgeストアでの配布を明示していません。この差分を既存回答で当然にカバーされると断定しません。

## 公開までの確認事項

1. Discussion #23の既存回答を根拠として保持する。拡張bundle・ストア配布や正式な著作権表示・許諾本文に不明点が残る場合は、ユーザーが上流作者へ確認し、回答を通知へ反映する。
2. ストア用の独自アイコン・紹介画像と実画面スクリーンショットを区別し、提出前に利用条件と掲載可否を確認する。元ツールの画面から任意設定により外部URLの画像を読み込む経路と、拡張ZIPに同梱する素材も区別する。
3. npm依存を更新した際は生成されたライセンス一覧の差分をレビューし、未知のライセンスや別条件の素材を確認する。
4. Pokémon/Pokémon Sleepの名称、キャラクター画像、ストア用アイコン・スクリーンショットは、元ツールのMIT表記だけで利用可能とは判断しない。非公式表示と掲載素材を [Issue #12](https://github.com/takus69/pokesleep-tool-extension/issues/12) で確認する。
5. 本文・実装・配布ZIPを照合し、残る権利上の不明点を公開判断者へ提示する。

## 追加確認が必要な場合の文案

> Pokémon Sleep Toolを元ページ上で拡張する、非公式のChrome/Edge拡張を開発しています。リポジトリREADMEの「License: MIT」を確認しました。拡張では元ツールの計算コード、データJSON、React画面部品の一部をbundleへ含め、ストアで配布する予定です。READMEのMIT表記はこれらの範囲にも適用されますか。また、配布物に記載すべき正式な著作権者表記・ライセンス本文や、別条件の素材があれば教えていただけますでしょうか。元ツールへのリンクと非公式である旨を明記する予定です。

ユーザーは拡張への作り直し、コード・データの一部の利用、Chrome/Edgeでの公開予定を作者へ連絡済みで、現在は回答待ちです。上記は追加確認が必要な場合の参考文案です。連絡と回答の記録はIssue #32で管理します。
