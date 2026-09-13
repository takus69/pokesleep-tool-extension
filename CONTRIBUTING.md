# Contributing

## 開発フロー

1. `develop`を更新する。
2. `develop`から目的別の短命ブランチを作る。
3. 変更前に入力・処理・出力と元ツールとの境界を確認する。
4. 関連する狭いテストを実行する。
5. `npm run verify`を実行する。
6. Conventional Commits形式でコミットする。
7. `develop`向けPull Requestを作成する。

`main`と`develop`へ直接pushしません。通常は`feature/`、`fix/`、`refactor/`、`docs/`、`chore/`を使用します。公開版の緊急修正だけは`main`から`hotfix/`を作り、公開後に`develop`へ反映します。

## Pull Request

- 一つのPRには一つの目的だけを含める。
- 利用者から見える変更、元ツールとの境界変更、未決事項を説明する。
- adapterや保存形式の変更にはcontract testを追加する。
- 計算仕様の変更にはbehavioral testを追加する。
- UI変更はChromeとEdgeで確認し、結果または未確認理由を記録する。
- 第三者コードを取り込む場合は`THIRD_PARTY_NOTICES.md`を更新する。
- 原則としてSquash Mergeを使用し、PRタイトルをConventional Commits形式にする。

## リリース

`develop`上の候補をChromeとEdgeで受入確認してから、`main`へのリリースPRを作成します。バージョンはSemantic Versioningの`MAJOR.MINOR.PATCH`、タグは`vX.Y.Z`です。受入済みの`main`コミットと同一の成果物をChrome Web StoreとMicrosoft Edge Add-onsへ提出します。

詳しい手順は[開発環境構築](docs/development.md)、[テスト手順](docs/testing.md)、[リリース手順](docs/release.md)を参照してください。
