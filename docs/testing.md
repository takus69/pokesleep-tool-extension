# テスト手順

- 狭い単体テスト: `npm run test -- src/integration/upstreamAdapter.test.ts`
- 型検査: `npm run typecheck`
- lint/format検査: `npm run lint`
- 本番ビルド: `npm run build`
- 全体: `npm run verify`

ローカル導入後、対象ページで「接続済み」表示、対象外URLで非起動、破損した検証対象保存値で安全停止、コンソールに予期しない例外がないことを確認します。ランキング移植後はforkとのfixture同値、キャンセル、古い結果の競合、上流保存値非変更も検証します。

## ブラウザ確認記録

- 2026-09-12: Microsoft Edgeを隔離プロファイルと `--load-extension=dist` で起動し、対象IVページを開いた。
- 2026-09-12: fork版React/MUI画面への置換後、型検査、lint、9単体テスト、自己完結bundleの本番ビルドに成功し、更新済み `dist` を別の隔離Edgeプロファイルで起動した。
- Windows画面操作ランタイムが内部アセットのパス欠落で初期化できず、UI操作とスクリーンショットによる自動受入確認は未完了。
- Google Chromeはこの環境で実行ファイルを検出できなかったため未確認。
