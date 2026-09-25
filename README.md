# Pokémon Sleep Tool Extension Suite

既存の [Pokémon Sleep Tool](https://nitoyon.github.io/pokesleep-tool/) に、ランキングなどの任意機能を追加するChrome／Edge向けManifest V3拡張です。ランキング独自実装の正本はこのリポジトリです。

## 利用する

現在はストア公開前の受入確認版です。[ローカルインストール手順](docs/local-installation.md)で `dist` を読み込み、[利用者向けマニュアル](docs/user-manual.md)に沿って利用できます。

## 現在の範囲

- 対象: デスクトップ版 Google Chrome、Microsoft Edge（Windowsで動作確認済み。macOSは未検証）
- 権限: 拡張設定用の `storage` と対象サイトだけのhost permission
- 外部コード: 実行時にダウンロードしない。元ツールの非実行JSONデータだけを検証後に更新可能
- 実装済み: 互換性プローブ、機能レジストリ、上段タブ統合、ランキング画面
- 未実装: Safari、Androidブックマークレット

## 開発

submoduleを含めてcloneし、Node.js 20以上で `npm install` 後、`npm run verify` を実行してください。成果物は `dist/` に生成されます。リリース前は `npm run release:prepare` で上流データ同期を含めて検証します。詳細は [開発手順](docs/development.md) と [テスト手順](docs/testing.md) を参照してください。

文書の一覧は [docs/README.md](docs/README.md) を参照してください。設計資料は [アーキテクチャ](docs/architecture.md)、元ツールとの詳細な境界仕様は [元ツール連携・互換性仕様](docs/upstream-integration.md) にあります。

開発への参加方法とPR運用は [CONTRIBUTING.md](CONTRIBUTING.md)、新機能の設計には [機能設計テンプレート](docs/design/feature-design-template.md) を参照してください。

## ライセンス

MIT Licenseです。第三者コードの帰属は [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) を参照してください。
