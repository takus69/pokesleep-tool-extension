# 開発環境構築

1. Node.js 20以上とnpmを準備する。
2. リポジトリルートで `npm install`。
3. `npm run test`、`npm run verify`。
4. `npm run build` で `dist/` を生成する。

元ツールforkは調査専用です。明示的な依頼なしに `C:\workspaces\pokesleep-tool` を変更しないでください。機能追加はdomainとadapterの境界を先に定義し、UIから元ツールのDOMや保存キーを直接参照しません。
