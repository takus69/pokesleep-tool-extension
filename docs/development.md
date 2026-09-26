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

## Issueのライフサイクル

IssueがClosedであることを、原則として変更が`main`へ反映済みである印とします。

Issueの進捗は拡張全体で1つのGitHub Projectの`Status`で管理します。ランキング、料理、共通基盤は同じProject内のビューで分けます。機能の分類には`area:ranking`、`area:cooking`、`area:shared`ラベルを使い、複数領域に関係するIssueには複数付けられます。機能ごとにProjectとStatusを重複して作りません。

Projectは[Pokémon Sleep Tool Extension](https://github.com/users/takus69/projects/4)とし、全体ビューのほかに`area:ranking`、`area:shared`で絞るビューを用意します。`area:cooking`のIssueを作った時点で料理ビューを追加します。リポジトリの新規Issueを自動追加し、既存Issueは初回に手動追加します。IssueをClosedにした時にStatusを`mainマージ済み`へ更新するワークフローを使い、Status変更だけでIssueを閉じるワークフローは有効にしません。Projectは現在非公開のため、閲覧には権限が必要です。

| Project Status | Issueの状態 | 更新する時点 |
|---|---|---|
| `未着手` | Open | Issue作成時。内容の相談だけでは作業中にしない。 |
| `作業中` | Open | 設計・実装・検証を開始した時。PRレビュー中も含む。 |
| `developマージ済み` | Open | Issueの対象変更がすべて`develop`へマージされた時。受入結果は別途コメントに記録する。 |
| `mainマージ済み` | Closed | リリースPRが`main`へマージされ、Issueが閉じた時。 |

追加のPRが必要になった場合は`作業中`へ戻します。設計Issueも同じ段階を使います。`main`へ反映してもストア公開などの作業が残るIssueは`作業中`のままとし、実際の完了後に手動で閉じて`mainマージ済み`にします。

1. 作業前にIssueを作成し、目的、対応範囲、完了条件を記載する。Projectへ追加して`未着手`にし、着手時に`作業中`へ変更する。
2. `develop`向けPRの「関連Issue」に`Refs #<番号>`を記載する。`Closes`、`Fixes`、`Resolves`は使用しない。
3. 対象変更が`develop`へすべてマージされたら、ProjectのStatusを`developマージ済み`にする。Chrome／Edgeの受入結果または手動確認不要の理由をIssueへコメントする。IssueはOpenのまま維持する。
4. `develop`から`main`へのリリースPRに、その版へ収録するIssueを`Closes #<番号>`で1行ずつ列挙する。
5. リリースPRがデフォルトブランチの`main`へマージされると、列挙したIssueをGitHubが自動で閉じる。ProjectのStatusを`mainマージ済み`にする。

ストア審査・公開など`main`反映後にも作業が残るIssueは、リリースPRでは`Refs #<番号>`に留め、実際の完了後に結果をコメントして手動で閉じます。設計Issueは決定内容が文書化されて`main`へ反映された時点、緊急修正Issueは`main`向けhotfix PRのマージ時点を完了とします。必要に応じてIssueをリリース版のMilestoneへ割り当てます。

## バージョン

[Semantic Versioning](https://semver.org/)の`MAJOR.MINOR.PATCH`を使用し、Gitタグは`vX.Y.Z`とします。

- `MAJOR`: 後方互換性のない変更。
- `MINOR`: 後方互換性を保った機能追加。
- `PATCH`: 後方互換性を保った不具合修正。

初回公開は`0.1.0`のβ版とします。`0.x.y`でもストアへ公開できます。β版であることはREADME・ストア掲載文・リリースノートに明記し、manifestの`version`には`0.1.0`のような数値だけを設定します。

`0.x.y`の間は、不具合修正をPATCH、機能追加や互換性のない仕様変更をMINORとして扱い、互換性のない変更はリリースノートに明記します。`1.0.0`以降は上記の通常のSemantic Versioningに従います。

`1.0.0`への移行は、ランキングの主要操作が安定し、重大な既知不具合がなく、利用者向け仕様・設定や保存データの互換性を維持する方針が固まった時点で判断します。不具合ゼロや、料理機能・Safari対応の完成は条件にしません。

リリース時は`package.json`、`public/manifest.json`、CHANGELOGの版を一致させます。文書・CI・データだけの変更は、ストア成果物を公開しない限りタグを作りません。
