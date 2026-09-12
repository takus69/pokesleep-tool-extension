# Pokémon Sleep Tool Extension Suite

既存の [Pokémon Sleep Tool](https://nitoyon.github.io/pokesleep-tool/) に、ランキングなどの任意機能を追加するChrome／Edge向けManifest V3拡張です。現在は上段の統合タブからfork版相当のランキング画面を利用できるブラウザ確認段階です。公開中のfork版を置き換えるものではありません。

## 現在の範囲

- 対象: Windows／macOS版 Google Chrome、Microsoft Edge
- 権限: 拡張設定用の `storage` と対象サイトだけのhost permission
- 外部コード: 実行時にダウンロードしない
- 実装済み: 互換性プローブ、機能レジストリ、上段タブ統合、fork版ランキング画面
- 未実装: Safari、Androidブックマークレット、ストア公開用の依存固定化

## 開発

Node.js 20以上で `npm install` 後、`npm run verify` を実行してください。成果物は `dist/` に生成されます。詳細は [開発手順](docs/development.md) と [テスト手順](docs/testing.md) を参照してください。

設計資料は [アーキテクチャ](docs/architecture.md)、調査結果と移行計画は [fork調査](docs/fork-audit.md) にあります。

## ライセンス

MIT Licenseです。上流およびfork由来部分の帰属は [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) を参照してください。
