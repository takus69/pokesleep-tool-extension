# 開発環境構築

1. Node.js 20以上とnpmを準備する。
2. リポジトリルートで `npm install`。
3. `npm run test`、`npm run verify`。
4. `npm run build` で `dist/` を生成する。

上流データを同期する場合は `POKESLEEP_TOOL_SOURCE` に元ツールのcheckoutを指定して `npm run sync:upstream-data` を実行します。未指定時は隣接する `../pokesleep-tool` を読み取ります。同期元commitと各JSONのSHA-256は `src/vendor/upstream-data/manifest.json` に記録されます。`npm run release:prepare` は同期後に全検証を実行します。

元ツールforkは調査専用です。明示的な依頼なしに `C:\workspaces\pokesleep-tool` を変更しないでください。機能追加はdomainとadapterの境界を先に定義し、UIから元ツールのDOMや保存キーを直接参照しません。
