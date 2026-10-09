# ストア公開・リリース手順

## 0.3.1提出準備の記録

2026-10-09、利用者からChrome・Edgeでの画面確認OKと、マージ・ストア準備の指示を受領しました。ストア提出・公開は未実施で、進捗と最終commit・ZIPハッシュは [Issue #91](https://github.com/takus69/pokesleep-tool-extension/issues/91) に記録します。

- 収録: 日本語名・初期言語修正 #87、公式上流更新・アイコン自動反映 #89
- 修正PR: #88 / #90（developマージ済み）
- 固定上流commit: `06569f6aeb1d3b9207208b45b27616e5a1f66d95`
- リリースタグ: `v0.3.1`（受入済みmainのcommitから新規作成）
- 共通申請ZIP: `pokesleep-tool-extension-v0.3.1.zip`
- 追加権限なし。計算・翻訳JSONと公式アイコンの図形・配色を取得し、取得ファイルを実行しない。
- 自動テストで同梱/ネットワーク/キャッシュ、通常色・色違い、取得後の再描画を確認。利用者による画面確認だけでは評価時の取得元を特定できない点は説明済み。
## 0.3.0公開の記録

2026-10-03、利用者からChrome Web StoreとMicrosoft Edge Add-onsの両方で`0.3.0`が公開されたとの報告を受けました。ストア公開日・版の記録はこの報告に基づきます。ストア版での起動と既存インストールへの自動更新の実機確認は未記録です。

- リリースPR: [#60](https://github.com/takus69/pokesleep-tool-extension/pull/60)、対応Issue: [#54](https://github.com/takus69/pokesleep-tool-extension/issues/54)
- 注釈付きタグ: `v0.3.0`、リリースcommit: `3e4d545765d8b6e69bec2528ee538c256bfe2194`
- 固定上流commit: `0dc4525b09a979582e9c1c5a3e10d4d65d0ad9d4`
- 共通申請ZIP: `pokesleep-tool-extension-v0.3.0.zip`（542137 bytes）
- ZIP SHA-256: `423b77a98859fe1b24fd3843b75b90f0d311c5328ea7cd14146d1a45e7900cf1`
- 受入候補の`release:prepare`成功（213テスト）。タグcommitから`npm ci`・`npm run build`成功。ZIP全10ファイルとアップロード後のハッシュを照合済み。

## 初回β公開の記録

初回β版`0.2.0`は[Chrome Web Store](https://chromewebstore.google.com/detail/mpipkmcenpcfekbpjlhepmflnbjhgpfh)と[Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/fajkddnhbedmajmmnljclpjnfjopanhl)で公開済みです。Gitタグは`v0.2.0`です。`v0.1.0`は開発ベースラインのタグであり、再利用しません。β版の運用と`1.0.0`への移行基準は[開発ルール](development.md#バージョン)に従います。

WindowsのChrome・Edgeは利用者による受入確認済みです。macOSは未検証として掲載しています。次回以降は、以下の手順で新しい候補を検証して公開します。

## リリース候補を作る

1. `develop`が最新で、未完了の変更がないことを確認する。
2. リリースする版をSemantic Versioningで決める。
3. 作業ブランチで `package.json`、`public/manifest.json`、CHANGELOGの版と内容を一致させる。
4. 対応する公式元ツールcommit、権限、第三者通知、[ライセンス監査](license-audit.md)の未解決事項、プライバシー方針を確認する。未解決の権利事項があればストア提出を進めない。
5. `npm run release:prepare` を実行する。
6. 生成したunpacked `dist` をChromeとEdgeの最新安定版で受入確認する。
7. `npm run test:store-assets`で画像寸法とmanifestの参照を確認し、`docs/store-listing.md`の実画面スクリーンショット、掲載文、権限説明を受入版と照合する。
8. `develop`へのPRをレビュー・マージする。

## mainへ昇格する

1. 受入済みの `develop` から `main` へのリリースPRを作成する。
2. PR本文に、その版への収録と同時に完了するIssueを`Closes #<番号>`で1行ずつ列挙する。
3. ストア公開などマージ後にも作業が残るIssueは`Refs #<番号>`として分ける。
4. 差分が今回のリリース対象だけであること、列挙したIssueの受入記録、必須CI成功を確認する。
5. PRをマージし、自動クローズ対象のIssueとマージされた `main` のcommitを確認する。ProjectのStatusを`mainマージ済み`にする。
6. 同commitへ注釈付きタグ `vX.Y.Z` を作成する。
7. タグのcommitから依存関係をクリーンインストールし、`npm run build` を実行する。
8. `dist` 内の `LICENSE` と `THIRD_PARTY_NOTICES.md` がルートの原本と一致し、`THIRD_PARTY_PACKAGE_LICENSES.md` に実際のbundle内の依存が列挙されていることを確認してからZIP化し、ハッシュを記録してGitHub Releaseへ添付する。

同じタグcommitから作成した同一成果物をChrome Web StoreとMicrosoft Edge Add-onsへ提出します。

## ストア提出物

- 拡張ZIP
- 名称、短い説明、詳細説明
- アイコン、スクリーンショット、必要に応じた紹介画像
- プライバシー方針の公開URL
- 権限ごとの利用目的
- サポートURL、問題報告先
- 対応ブラウザと既知の制限

掲載文案と素材の対応は [ストア掲載情報](store-listing.md) を使用し、実際の版と画面に合わせて更新します。ストア画面の最新要件と、プライバシー方針・サポートURLを匿名ブラウザから開けることも提出直前に確認します。

## 提出後

1. 両ストアの審査状態と提出した版を記録する。
2. 差し戻し理由がある場合は `fix/` ブランチで修正し、同じ検証・PR手順を繰り返す。
3. 公開後、ストア上の版、対象ページでの起動、更新配信を確認する。
4. リリースノートへ対応上流commit、既知問題、成果物ハッシュを記録する。

## 上流データ同期

`Sync upstream data` workflowは公式元ツールをcheckoutし、非実行JSONの同期、型検査、lint、テスト、ビルドを通過した変更だけを `develop` 向けPRにします。PRではデータmanifestのcommit、除外された未知仕様、ランキング回帰結果を確認します。計算コードの更新とストア公開は自動化せず、通常のレビューと受入確認を行います。

署名鍵、ストア資格情報、公開操作は管理者が扱い、リポジトリへ保存しません。

## 緊急修正

公開版の緊急修正は `main` から `hotfix/` ブランチを作り、`main`向けPRに`Closes #<番号>`を記載して反映します。PATCH版として検証・タグ・提出した後、修正を `develop` へ戻します。
