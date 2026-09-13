# 既存fork調査と移行計画

調査日: 2026-09-12。参照元は `C:\workspaces\pokesleep-tool` の `main` (`42b0c4ae`) と `upstream/main` (`e223123c`)、差分は27コミット、57ファイル、約11,112行追加です。参照のみで変更していません。

## 移管結果

ランキング独自コードは `src/features/ranking` へ移管済みで、本リポジトリを唯一の正本とします。旧forkは履歴とライセンスの出典であり、ビルド、テスト、CI、実行時の依存先ではありません。公式元ツールは `vendor/pokesleep-tool` のsubmodule commit `aec938d72d52fe875029aae13f58ae850db2fe98` に固定し、上流内部パスへの依存は `@upstream` aliasとintegration層を境界として管理します。

移管時に公式最新版でMewの基礎確率が正式データ化されていることを確認し、旧fork固有の `StrengthParameter.mew` 特例を削除しました。上流が `rateNotFixed` とする未知確率は引き続きランキングから除外し、推測値を表示しません。

## コードの区分

- 上流由来: `src/ui`, 既存の `src/util`, `src/data`。forkは境界文書上、上流所有18ファイルを同一に保つ方針。
- fork追加: `src/fork/**`、ランキング4 utilityとテスト、fork配備・境界検証・文書・翻訳。
- 派生: `RankingWorkspace`, `RankingApp`, `RankingEnvironmentForm`, `RankingPokemonDetailDialog` は上流React構成を再利用／派生している。

## 再利用性

`NumericRanking.ts`, `IngredientRanking.ts`, `PokemonRanking.ts`, `RankingScenario.ts` は比較的純粋ですが、上流domain型・静的データ・計算utilityへの依存を棚卸ししてから段階移植します。`src/fork` のReact/MUI UI、hooks、reducer、翻訳は上流画面へ密結合しているため直接コピーしません。ランキング状態 `PstForkRankingScenarios.v1` も新拡張用スキーマへ明示的に移行します。

forkはMITで、元著作権表示と2026年の変更著作権表示を持ちます。移植時は原ファイルと変更履歴を記録し、通知を配布物へ同梱します。

## 段階計画

1. MV3、機能レジストリ、設定、互換性プローブ、Shadow DOMの疎通（本変更）。
2. 上流データ型とランキング依存グラフを確定し、純粋domainをテストごと移植。
3. 元ツール保存値のversioned decoderをfixture契約テスト付きで実装。
4. ランキングUIを拡張用に再構成し、forkとの同値テストを追加。
5. 対応上流バージョン表、手動E2E、ストア用資材、プライバシー審査。
6. 安定公開後にのみfork版の廃止を別判断する。

各段階は狭いテスト、全体 `npm run verify`、レビュー可能な単一目的コミットの順に行います。
