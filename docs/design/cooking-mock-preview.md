# 料理モックの起動

元ツールとランキング比較のReact部品を直接使うため、HTML単体の配信ではなくViteで起動します。リポジトリルートで実行します。

```powershell
npx vite --config docs/design/cooking-mock.vite.config.ts
```

http://127.0.0.1:8765/cooking-planner-mock.html を開きます。既に8765を別のプレビューが使用している場合は、そのプレビューを終了してから起動してください。

モック単体のビルド確認：

```powershell
npx vite build --config docs/design/cooking-mock.vite.config.ts
npx tsc --project docs/design/cooking-mock.tsconfig.json
```

出力は無視対象の `dist/cooking-mock`。通常の拡張ビルドにこのエントリを追加しません。ポケモンのフォーム・参照ボックスは元ツール／ランキングの実部品を使いますが、ボックス内の個体と日次取得率・発動率はモック用です。フォーム編集はローカル状態だけを更新し、元ツールの保存値や実個体能力の計算結果を変更しません。

鍋の必要回数は設定例の容量条件で自動集計します。料理チャンスの確率・再充填方式の必要発動期待値は仕様未確定なので計算しません。
