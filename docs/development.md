# 開発環境構築

1. Node.js 20以上とnpmを準備する。
2. リポジトリルートで `npm install`。
3. `npm run test`、`npm run verify`。
4. `npm run build` で `dist/` を生成する。

checkout時は `git clone --recurse-submodules`、既存checkoutでは `git submodule update --init --recursive` を実行します。元ツールは `vendor/pokesleep-tool` に検証済みcommitで固定されます。

上流データを同期する場合は `POKESLEEP_TOOL_SOURCE` に別の元ツールcheckoutを指定して `npm run sync:upstream-data` を実行します。未指定時は固定submoduleを読み取ります。同期元commitと各JSONのSHA-256は `src/vendor/upstream-data/manifest.json` に記録されます。`npm run release:prepare` は同期後に全検証を実行します。

機能追加はdomainとadapterの境界を先に定義し、UIから元ツールのDOMや保存キーを直接参照しません。元ツールとの境界変更時は [元ツール連携・互換性仕様](upstream-integration.md) を更新します。

## ブランチとPR

- `main`: 公開可能な履歴。直接pushしない。
- `develop`: 次回リリースの統合先。直接pushしない。
- `feature/<name>`: 後方互換な機能追加。
- `fix/<name>`: 通常の不具合修正。
- `refactor/<name>`、`docs/<name>`、`chore/<name>`: 挙動を変えない整理、文書、保守作業。
- `hotfix/<name>`: 公開版の緊急修正。`main`から分岐する。

通常作業は`develop`から作業ブランチを作り、狭いテストと`npm run verify`を通して`develop`へのPRを作成します。PRはレビューと必須CIを通してからマージします。`develop`上の候補をunpacked extensionとしてChromeとEdgeで受入確認し、問題がなければ`develop`から`main`へのリリースPRを作成します。

原則としてSquash Mergeを使い、PRタイトルをConventional Commits形式にします。複数の独立した変更を一つのPRへ混在させません。緊急修正は`main`から`hotfix/<name>`を作り、公開後に`main`の修正を`develop`へ反映します。

## バージョン

[Semantic Versioning](https://semver.org/)の`MAJOR.MINOR.PATCH`を使用し、Gitタグは`vX.Y.Z`とします。

- `MAJOR`: 後方互換性のない変更。
- `MINOR`: 後方互換性を保った機能追加。
- `PATCH`: 後方互換性を保った不具合修正。

開発確認段階は`0.x.y`、最初の正式公開は`1.0.0`とします。リリース時は`package.json`、`public/manifest.json`、CHANGELOGの版を一致させます。文書・CI・データだけの変更は、ストア成果物を公開しない限りタグを作りません。
